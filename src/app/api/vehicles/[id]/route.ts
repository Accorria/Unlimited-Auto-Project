import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params

    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // First, delete all photos associated with this vehicle
    const { error: photosError } = await supabase
      .from('vehicle_photos')
      .delete()
      .eq('vehicle_id', vehicleId)

    if (photosError) {
      console.error('Error deleting vehicle photos:', photosError)
      return NextResponse.json({ error: 'Failed to delete vehicle photos' }, { status: 500 })
    }

    // Then delete the vehicle
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)

    if (vehicleError) {
      console.error('Error deleting vehicle:', vehicleError)
      return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle and all associated photos deleted successfully' 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
