import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/assignments/[id] - Update an assignment (mainly for logging hours)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { allocatedHours, loggedHours } = body

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(allocatedHours !== undefined && { allocatedHours: Number(allocatedHours) }),
        ...(loggedHours !== undefined && { loggedHours: Number(loggedHours) }),
      },
      include: {
        project: true,
        staff: true,
        role: true,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

// DELETE /api/assignments/[id] - Remove an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.assignment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}
