import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const dealerSlug = searchParams.get('dealer') || 'unlimited-auto'

    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // First, get the dealer ID from the slug
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', dealerSlug)
      .single()

    if (dealerError || !dealer) {
      console.error('Error fetching dealer:', dealerError)
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    let query = supabase
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
      .eq('dealer_id', dealer.id)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    // Apply filters
    if (make) query = query.eq('make', make)
    if (model) query = query.eq('model', model)
    if (year) query = query.eq('year', parseInt(year))
    if (minPrice) query = query.gte('price', parseInt(minPrice))
    if (maxPrice) query = query.lte('price', parseInt(maxPrice))

    const { data: vehicles, error } = await query

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
    }

    // Transform data to include cover photo (first photo by angle order)
    const transformedVehicles = vehicles?.map(vehicle => {
      const vehiclePhotos = vehicle.vehicle_photos || []
      const coverPhoto = vehiclePhotos.find(photo => photo.angle === 'FDS') || 
                        vehiclePhotos.find(photo => photo.angle === 'FPS') || 
                        vehiclePhotos.find(photo => photo.angle === 'F') || 
                        vehiclePhotos[0]

      return {
        ...vehicle,
        coverPhoto: coverPhoto?.public_url || vehicle.photos?.[0] || null,
        photos: vehicle.photos || vehiclePhotos.map(p => p.public_url),
        // Map database fields to expected API response format
        transmission: vehicle.transmission,
        drivetrain: vehicle.drivetrain,
        engine: vehicle.engine,
        mpg: vehicle.mpg,
        bodyStyle: vehicle.body_style,
        doors: vehicle.doors,
        passengers: vehicle.passengers,
        fuelType: vehicle.fuel_type,
        color: vehicle.exterior_color,
        interiorColor: vehicle.interior_color,
        condition: vehicle.condition || 'Good',
        downPayment: vehicle.down_payment || 999
      }
    }) || []

    return NextResponse.json({ vehicles: transformedVehicles })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received vehicle data:', body)

    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // First, get the dealer ID from the slug
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      console.error('Error fetching dealer:', dealerError)
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Keep description short and clean - don't add specifications to description
    const cleanDescription = body.description || 'Great value, perfect for families, financing available'

    // Insert the vehicle (only fields that exist in database)
    const vehicleData: any = {
      dealer_id: dealer.id,
      year: body.year,
      make: body.make,
      model: body.model,
      trim: body.trim,
      miles: body.miles,
      price: body.price,
      description: cleanDescription,
      status: body.status || 'available',
      // Add specification fields if they exist in database
      engine: body.engine || null,
      transmission: body.transmission || null,
      drivetrain: body.drivetrain || null,
      mpg: body.mpg || null,
      body_style: body.bodyStyle || null,
      doors: body.doors || null,
      passengers: body.passengers || null,
      fuel_type: body.fuelType || null,
      exterior_color: body.color || null,
      interior_color: body.interiorColor || null,
      down_payment: body.downPayment || 999
    }

    // Only include VIN if it's provided and not empty
    if (body.vin && body.vin.trim() !== '') {
      vehicleData.vin = body.vin
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single()

    if (vehicleError) {
      console.error('Error inserting vehicle:', vehicleError)
      console.error('Vehicle data being inserted:', vehicleData)
      
      // Handle specific error cases
      if (vehicleError.code === '23505' && vehicleError.message.includes('vehicles_vin_key')) {
        return NextResponse.json({ 
          error: 'A vehicle with this VIN already exists. Please use a different VIN or leave it blank.', 
          details: vehicleError.message,
          code: vehicleError.code 
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to save vehicle', 
        details: vehicleError.message,
        code: vehicleError.code 
      }, { status: 500 })
    }

    // Save vehicle photos if provided
    if (body.images && body.images.length > 0) {
      console.log('Saving photos for vehicle:', vehicle.id, 'Images:', body.images)
      
      const angleOrder = ['FDS','FPS','SDS','SPS','SRDS','SRPS','RDS','R','F','INT','INTB','ENG','TRK','ODOM','VIN']
      
      const photoInserts = body.images.map((imageUrl: string, index: number) => ({
        vehicle_id: vehicle.id,
        file_path: imageUrl,
        public_url: imageUrl,
        angle: angleOrder[index] || 'F', // Use proper angle codes, default to 'F' if more than 15 photos
        created_at: new Date().toISOString()
      }))

      console.log('Photo inserts:', photoInserts)

      const { error: photosError } = await supabase
        .from('vehicle_photos')
        .insert(photoInserts)

      if (photosError) {
        console.error('Error inserting photos:', photosError)
        // Don't fail the whole request, just log the error
      } else {
        console.log('Photos saved successfully for vehicle:', vehicle.id)
      }
    } else {
      console.log('No images provided for vehicle:', vehicle.id)
    }

    console.log('Vehicle saved successfully:', vehicle)
    return NextResponse.json({ 
      success: true, 
      vehicle: vehicle,
      message: 'Vehicle added successfully!' 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
