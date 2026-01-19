import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateTotalHours, recalculateProjectAllocations } from '@/lib/calculations'

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            staff: true,
            role: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check if deal size or blended rate changed
    const existingProject = await prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const newDealSize = dealSize !== undefined ? Number(dealSize) : Number(existingProject.dealSize)
    const newBlendedRate = blendedRate !== undefined ? Number(blendedRate) : Number(existingProject.blendedRate)
    const totalHours = calculateTotalHours(newDealSize, newBlendedRate)

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(status && { status }),
        ...(dealSize !== undefined && { dealSize: newDealSize }),
        ...(blendedRate !== undefined && { blendedRate: newBlendedRate }),
        totalHours,
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(periodMonths !== undefined && { periodMonths: periodMonths ? Number(periodMonths) : null }),
        ...(enduserName !== undefined && { enduserName: enduserName || null }),
        ...(partnerName !== undefined && { partnerName: partnerName || null }),
        ...(techStack !== undefined && { techStack: techStack || null }),
        ...(googleDriveUrl !== undefined && { googleDriveUrl: googleDriveUrl || null }),
        ...(documents !== undefined && { documents: documents || null }),
      },
    })

    // Recalculate assignments if deal size or blended rate changed
    if (
      dealSize !== undefined &&
      Number(existingProject.dealSize) !== newDealSize
    ) {
      await recalculateProjectAllocations(id)
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
