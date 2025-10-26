import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { vehicleIds } = await req.json()
    
    if (!vehicleIds || !Array.isArray(vehicleIds)) {
      return NextResponse.json({ error: 'Invalid vehicle IDs' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update the display order for each vehicle
    const updatePromises = vehicleIds.map((vehicleId: string, index: number) => 
      supabase
        .from('vehicles')
        .update({ display_order: index + 1 })
        .eq('id', vehicleId)
    )

    const results = await Promise.all(updatePromises)
    
    // Check if any updates failed
    const failedUpdates = results.filter(result => result.error)
    if (failedUpdates.length > 0) {
      console.error('Some vehicle order updates failed:', failedUpdates)
      return NextResponse.json({ error: 'Failed to update some vehicle orders' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle order updated successfully' 
    })

  } catch (error: any) {
    console.error('Error reordering vehicles:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
