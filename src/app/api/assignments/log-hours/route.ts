import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/assignments/log-hours - Log hours for an assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignmentId, hours } = body

    if (!assignmentId || hours === undefined) {
      return NextResponse.json(
        { error: 'Assignment ID and hours are required' },
        { status: 400 }
      )
    }

    // Get current assignment
    const current = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    })

    if (!current) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Add hours to existing logged hours
    const newLoggedHours = Number(current.loggedHours) + Number(hours)

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { loggedHours: newLoggedHours },
      include: {
        project: true,
        staff: true,
        role: true,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error logging hours:', error)
    return NextResponse.json(
      { error: 'Failed to log hours' },
      { status: 500 }
    )
  }
}
