import { NextRequest, NextResponse } from 'next/server'
import { calculateProjectAllocation } from '@/lib/calculations'

// POST /api/projects/[id]/calculate - Calculate project allocation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const allocation = await calculateProjectAllocation(id)
    return NextResponse.json(allocation)
  } catch (error) {
    console.error('Error calculating allocation:', error)
    return NextResponse.json(
      { error: 'Failed to calculate allocation' },
      { status: 500 }
    )
  }
}
