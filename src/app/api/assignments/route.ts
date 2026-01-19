import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { autoAssignStaffToProject } from '@/lib/calculations'

// GET /api/assignments - List all assignments (optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const staffId = searchParams.get('staffId')

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(staffId && { staffId }),
      },
      include: {
        project: true,
        staff: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// POST /api/assignments - Create or update an assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, staffId, roleId, allocatedHours, loggedHours } = body

    if (!projectId || !staffId || !roleId) {
      return NextResponse.json(
        { error: 'Project ID, staff ID, and role ID are required' },
        { status: 400 }
      )
    }

    // Use upsert to handle both create and update
    const assignment = await prisma.assignment.upsert({
      where: {
        projectId_staffId_roleId: {
          projectId,
          staffId,
          roleId,
        },
      },
      update: {
        ...(allocatedHours !== undefined && { allocatedHours: Number(allocatedHours) }),
        ...(loggedHours !== undefined && { loggedHours: Number(loggedHours) }),
      },
      create: {
        projectId,
        staffId,
        roleId,
        allocatedHours: allocatedHours !== undefined ? Number(allocatedHours) : 0,
        loggedHours: loggedHours !== undefined ? Number(loggedHours) : 0,
      },
      include: {
        project: true,
        staff: true,
        role: true,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}
