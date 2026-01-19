import { prisma } from './prisma'
import { Decimal } from '@prisma/client/runtime/library'

export interface AllocationResult {
  roleId: string
  roleName: string
  percentage: number
  allocatedHours: number
}

export interface ProjectAllocation {
  projectId: string
  projectName: string
  dealSize: number
  blendedRate: number
  totalHours: number
  allocations: AllocationResult[]
}

/**
 * Calculate total billable hours from deal size and blended rate
 * Formula: total_hours = deal_size / blended_rate
 */
export function calculateTotalHours(dealSize: number, blendedRate: number): number {
  if (blendedRate <= 0) {
    throw new Error('Blended rate must be greater than zero')
  }
  return dealSize / blendedRate
}

/**
 * Calculate hours for a specific role based on percentage
 * Formula: role_hours = total_hours * (percentage / 100)
 */
export function calculateRoleHours(totalHours: number, percentage: number): number {
  return totalHours * (percentage / 100)
}

/**
 * Calculate and update project allocation
 * Updates the project's totalHours and returns allocation breakdown by role
 */
export async function calculateProjectAllocation(projectId: string): Promise<ProjectAllocation> {
  // Get project details
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    throw new Error(`Project not found: ${projectId}`)
  }

  // Get all roles with their default percentages
  const roles = await prisma.role.findMany({
    orderBy: { defaultAllocationPercentage: 'desc' },
  })

  const dealSize = Number(project.dealSize)
  const blendedRate = Number(project.blendedRate)
  const totalHours = calculateTotalHours(dealSize, blendedRate)

  // Update project with calculated total hours
  await prisma.project.update({
    where: { id: projectId },
    data: { totalHours },
  })

  // Calculate allocation for each role
  const allocations: AllocationResult[] = roles.map((role) => {
    const percentage = Number(role.defaultAllocationPercentage)
    return {
      roleId: role.id,
      roleName: role.roleName,
      percentage,
      allocatedHours: calculateRoleHours(totalHours, percentage),
    }
  })

  return {
    projectId: project.id,
    projectName: project.name,
    dealSize,
    blendedRate,
    totalHours,
    allocations,
  }
}

/**
 * Recalculate allocations when deal size changes
 * Updates existing assignments with new allocated hours
 */
export async function recalculateProjectAllocations(projectId: string): Promise<void> {
  const allocation = await calculateProjectAllocation(projectId)

  // Get existing assignments for this project
  const assignments = await prisma.assignment.findMany({
    where: { projectId },
    include: { role: true },
  })

  // Update each assignment with new allocated hours based on role percentage
  for (const assignment of assignments) {
    const roleAllocation = allocation.allocations.find(
      (a) => a.roleId === assignment.roleId
    )

    if (roleAllocation) {
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { allocatedHours: roleAllocation.allocatedHours },
      })
    }
  }
}

/**
 * Get staff workload summary
 * Returns total allocated hours per staff member across all projects
 */
export async function getStaffWorkload(): Promise<
  Array<{
    staffId: string
    staffName: string
    roleName: string
    totalAllocatedHours: number
    totalLoggedHours: number
    isOverAllocated: boolean
  }>
> {
  const staff = await prisma.staff.findMany({
    include: {
      role: true,
      assignments: true,
    },
  })

  return staff.map((s) => {
    const totalAllocatedHours = s.assignments.reduce(
      (sum, a) => sum + Number(a.allocatedHours),
      0
    )
    const totalLoggedHours = s.assignments.reduce(
      (sum, a) => sum + Number(a.loggedHours),
      0
    )

    return {
      staffId: s.id,
      staffName: s.name,
      roleName: s.role.roleName,
      totalAllocatedHours,
      totalLoggedHours,
      isOverAllocated: totalAllocatedHours > 40, // Weekly threshold
    }
  })
}

/**
 * Auto-assign staff to a project based on role defaults
 * Creates assignments for each role with calculated hours
 */
export async function autoAssignStaffToProject(
  projectId: string,
  staffAssignments: Array<{ staffId: string; roleId: string }>
): Promise<void> {
  const allocation = await calculateProjectAllocation(projectId)

  for (const { staffId, roleId } of staffAssignments) {
    const roleAllocation = allocation.allocations.find((a) => a.roleId === roleId)

    if (!roleAllocation) {
      throw new Error(`Role not found: ${roleId}`)
    }

    await prisma.assignment.upsert({
      where: {
        projectId_staffId_roleId: {
          projectId,
          staffId,
          roleId,
        },
      },
      update: {
        allocatedHours: roleAllocation.allocatedHours,
      },
      create: {
        projectId,
        staffId,
        roleId,
        allocatedHours: roleAllocation.allocatedHours,
        loggedHours: 0,
      },
    })
  }
}
