import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params

    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // Fetch the vehicle with its photos
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_photos (
          id,
          angle,
          public_url,
          file_path
        )
      `)
      .eq('id', vehicleId)
      .single()

    if (error) {
      console.error('Error fetching vehicle:', error)
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Transform data to include cover photo
    const photos = vehicle.vehicle_photos || []
    const coverPhoto = photos.find(photo => photo.angle === 'FDS') || 
                      photos.find(photo => photo.angle === 'FPS') || 
                      photos.find(photo => photo.angle === 'F') || 
                      photos[0]

    const transformedVehicle = {
      ...vehicle,
      coverPhoto: coverPhoto?.public_url || null,
      photos: photos.sort((a, b) => {
        const angleOrder = ['FDS','FPS','SDS','SPS','SRDS','SRPS','RDS','R','F','INT','INTB','ENG','TRK','ODOM','VIN']
        return angleOrder.indexOf(a.angle) - angleOrder.indexOf(b.angle)
      })
    }

    return NextResponse.json(transformedVehicle)

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params
    const body = await req.json()
    console.log('Updating vehicle:', vehicleId, body)

    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // Update the vehicle
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update({
        year: body.year,
        make: body.make,
        model: body.model,
        trim: body.trim,
        miles: body.miles,
        price: body.price,
        vin: body.vin,
        description: body.description,
        status: body.status || 'active',
        // Specification fields
        engine: body.engine,
        transmission: body.transmission,
        drivetrain: body.drivetrain,
        mpg: body.mpg,
        body_style: body.bodyStyle,
        doors: body.doors,
        passengers: body.passengers,
        fuel_type: body.fuelType,
        exterior_color: body.color,
        interior_color: body.interiorColor,
        down_payment: body.downPayment || 999
      })
      .eq('id', vehicleId)
      .select()
      .single()

    if (error) {
      console.error('Error updating vehicle:', error)
      return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
    }

    console.log('Vehicle updated successfully:', vehicle)
    return NextResponse.json({ 
      success: true, 
      vehicle: vehicle,
      message: 'Vehicle updated successfully!' 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
