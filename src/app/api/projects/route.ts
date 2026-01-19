import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateTotalHours, recalculateProjectAllocations } from '@/lib/calculations'

// GET /api/projects - List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        assignments: {
          include: {
            staff: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      status,
      dealSize,
      blendedRate,
      startDate,
      endDate,
      periodMonths,
      enduserName,
      partnerName,
      techStack,
      googleDriveUrl,
      documents,
    } = body

    if (!name || !dealSize || !blendedRate) {
      return NextResponse.json(
        { error: 'Name, deal size, and blended rate are required' },
        { status: 400 }
      )
    }

    const totalHours = calculateTotalHours(Number(dealSize), Number(blendedRate))

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status: status || 'ACTIVE',
        dealSize: Number(dealSize),
        blendedRate: Number(blendedRate),
        totalHours,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        periodMonths: periodMonths ? Number(periodMonths) : null,
        enduserName: enduserName || null,
        partnerName: partnerName || null,
        techStack: techStack || null,
        googleDriveUrl: googleDriveUrl || null,
        documents: documents || null,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
