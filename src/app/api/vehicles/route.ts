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
      const photos = vehicle.vehicle_photos || []
      const coverPhoto = photos.find(photo => photo.angle === 'FDS') || 
                        photos.find(photo => photo.angle === 'FPS') || 
                        photos.find(photo => photo.angle === 'F') || 
                        photos[0]

      return {
        ...vehicle,
        coverPhoto: coverPhoto?.public_url || null,
        photos: photos.sort((a, b) => {
          const angleOrder = ['FDS','FPS','SDS','SPS','SRDS','SRPS','RDS','R','F','INT','INTB','ENG','TRK','ODOM','VIN']
          return angleOrder.indexOf(a.angle) - angleOrder.indexOf(b.angle)
        })
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

    // Insert the vehicle (only fields that exist in database)
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        dealer_id: dealer.id,
        year: body.year,
        make: body.make,
        model: body.model,
        trim: body.trim,
        miles: body.miles,
        price: body.price,
        vin: body.vin,
        description: body.description,
        status: body.status || 'available'
      })
      .select()
      .single()

    if (vehicleError) {
      console.error('Error inserting vehicle:', vehicleError)
      return NextResponse.json({ error: 'Failed to save vehicle' }, { status: 500 })
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
