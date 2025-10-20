import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

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
      .eq('dealer_id', 'unlimited-auto')
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
