import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

// Produces a simple CSV feed for lenders/aggregators (e.g., Westlake)
// URL suggestion: https://www.unlimitedautorepaircollision.com/api/feeds/westlake
// You can append .csv as well; content-type is text/csv

type VehicleRow = {
  id: string
  stockNumber?: string | null
  vin?: string | null
  year?: number | null
  make?: string | null
  model?: string | null
  trim?: string | null
  body?: string | null
  drivetrain?: string | null
  transmission?: string | null
  engine?: string | null
  exteriorColor?: string | null
  interiorColor?: string | null
  fuelType?: string | null
  miles?: number | null
  price?: number | null
  condition?: string | null
  description?: string | null
  status?: string | null
  coverPhoto?: string | null
  vehicle_photos?: { public_url: string }[] | null
}

function csvEscape(value: any): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export async function GET() {
  try {
    const supabase = createServerClient()

    // Fetch active/available vehicles with photos
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        id, stockNumber, vin, year, make, model, trim, body, drivetrain, transmission, engine,
        exteriorColor, interiorColor, fuelType, miles, price, condition, description, status, coverPhoto,
        vehicle_photos(public_url)
      `)
      .neq('status', 'sold')
      .order('year', { ascending: false })

    if (error) {
      console.error('Feed query error:', error)
      return new NextResponse('Feed unavailable', { status: 503 })
    }

    const headers = [
      'dealer_name',
      'dealer_phone',
      'dealer_address',
      'stock',
      'vin',
      'year',
      'make',
      'model',
      'trim',
      'body',
      'drivetrain',
      'transmission',
      'engine',
      'exterior_color',
      'interior_color',
      'fuel_type',
      'mileage',
      'price',
      'condition',
      'status',
      'description',
      'main_photo_url',
      'photo_urls'
    ]

    const dealerName = 'Unlimited Auto Repair & Collision'
    const dealerPhone = '(313) 766-4475'
    const dealerAddress = '24645 Plymouth Rd Unit A, Redford Township, MI 48239'

    const rows: string[] = []
    rows.push(headers.join(','))

    (vehicles as VehicleRow[] | null)?.forEach((v) => {
      const photos = v.vehicle_photos?.map(p => p.public_url) || []
      const mainPhoto = photos[0] || v.coverPhoto || ''
      const photoUrls = photos.join('|')

      const row = [
        dealerName,
        dealerPhone,
        dealerAddress,
        v.stockNumber || '',
        v.vin || '',
        v.year ?? '',
        v.make || '',
        v.model || '',
        v.trim || '',
        v.body || '',
        v.drivetrain || '',
        v.transmission || '',
        v.engine || '',
        v.exteriorColor || '',
        v.interiorColor || '',
        v.fuelType || '',
        v.miles ?? '',
        v.price ?? '',
        v.condition || '',
        v.status || 'available',
        v.description || '',
        mainPhoto,
        photoUrls
      ].map(csvEscape).join(',')

      rows.push(row)
    })

    const csv = rows.join('\n') + '\n'

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5 minutes
      }
    })
  } catch (e) {
    console.error('Feed error:', e)
    return new NextResponse('Feed error', { status: 500 })
  }
}


