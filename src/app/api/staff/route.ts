import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/staff - List all staff
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        role: true,
        assignments: {
          include: {
            project: true,
            role: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Calculate totals for each staff member
    const staffWithTotals = staff.map((s) => ({
      ...s,
      totalAllocatedHours: s.assignments.reduce(
        (sum, a) => sum + Number(a.allocatedHours),
        0
      ),
      totalLoggedHours: s.assignments.reduce(
        (sum, a) => sum + Number(a.loggedHours),
        0
      ),
    }))

    return NextResponse.json(staffWithTotals)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, hourlyCost, hoursQuota } = body

    if (!name || hourlyCost === undefined) {
      return NextResponse.json(
        { error: 'Name and hourly cost are required' },
        { status: 400 }
      )
    }

    // Get default role (first available)
    const defaultRole = await prisma.role.findFirst({
      orderBy: { defaultAllocationPercentage: 'desc' },
    })

    if (!defaultRole) {
      return NextResponse.json(
        { error: 'No roles available' },
        { status: 400 }
      )
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        title: title || null,
        roleId: defaultRole.id,
        hourlyCost: Number(hourlyCost),
        hoursQuota: hoursQuota ? Number(hoursQuota) : 40,
      },
      include: {
        role: true,
      },
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    )
  }
}
