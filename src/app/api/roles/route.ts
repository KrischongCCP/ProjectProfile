import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/roles - List all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { defaultAllocationPercentage: 'desc' },
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roleName, defaultAllocationPercentage } = body

    if (!roleName || defaultAllocationPercentage === undefined) {
      return NextResponse.json(
        { error: 'Role name and default allocation percentage are required' },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        roleName,
        defaultAllocationPercentage: Number(defaultAllocationPercentage),
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}

// PUT /api/roles - Batch update role percentages
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { roles } = body as { roles: { id: string; defaultAllocationPercentage: number }[] }

    if (!roles || !Array.isArray(roles)) {
      return NextResponse.json(
        { error: 'Roles array is required' },
        { status: 400 }
      )
    }

    // Validate total is 100%
    const total = roles.reduce((sum, r) => sum + Number(r.defaultAllocationPercentage), 0)
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Total allocation must equal 100%' },
        { status: 400 }
      )
    }

    // Update all roles in a transaction
    await prisma.$transaction(
      roles.map((role) =>
        prisma.role.update({
          where: { id: role.id },
          data: { defaultAllocationPercentage: Number(role.defaultAllocationPercentage) },
        })
      )
    )

    const updatedRoles = await prisma.role.findMany({
      orderBy: { defaultAllocationPercentage: 'desc' },
    })

    return NextResponse.json(updatedRoles)
  } catch (error) {
    console.error('Error updating roles:', error)
    return NextResponse.json(
      { error: 'Failed to update roles' },
      { status: 500 }
    )
  }
}
