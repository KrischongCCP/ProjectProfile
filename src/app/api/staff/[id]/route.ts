import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/staff/[id] - Get a single staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        role: true,
        assignments: {
          include: {
            project: true,
            role: true,
          },
        },
      },
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

// PUT /api/staff/[id] - Update a staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, title, hourlyCost, hoursQuota, email, phone, bio, executiveSummary, skills, education, experience, certifications } = body

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...(name && { name }),
        title: title || null,
        ...(hourlyCost !== undefined && { hourlyCost: Number(hourlyCost) }),
        ...(hoursQuota !== undefined && { hoursQuota: Number(hoursQuota) }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(executiveSummary !== undefined && { executiveSummary: executiveSummary || null }),
        ...(skills !== undefined && { skills: skills || null }),
        ...(education !== undefined && { education: education || null }),
        ...(experience !== undefined && { experience: experience || null }),
        ...(certifications !== undefined && { certifications: certifications || null }),
      },
      include: {
        role: true,
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/[id] - Delete a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.staff.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    )
  }
}
