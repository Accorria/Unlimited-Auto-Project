import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

// POST /api/inventory/import-csv
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { dealerId, vehicles } = body

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      return NextResponse.json(
        { error: 'vehicles array is required' },
        { status: 400 }
      )
    }

    // Validate required fields and normalize data
    const validatedVehicles = vehicles.map((v: any) => {
      // Required fields: year, make, model, vin, price, miles
      if (!v.year || !v.make || !v.model || !v.vin || !v.price || v.miles === undefined) {
        throw new Error(`Missing required fields for vehicle: ${v.vin || 'unknown'}`)
      }

      return {
        dealer_id: dealerId,
        vin: v.vin,
        year: parseInt(v.year),
        make: v.make,
        model: v.model,
        model_code: v.model_code || null,
        trim: v.trim || null,
        miles: parseInt(v.miles),
        price: parseInt(v.price),
        cost: v.cost ? parseInt(v.cost) : null,
        ext_color: v.ext_color || v.color || null,
        int_color: v.int_color || null,
        title_status: v.title_status || 'clean',
        description: v.description || v.features || null,
        status: v.status || 'available',
        first_listed_at: v.first_listed_at ? new Date(v.first_listed_at).toISOString() : new Date().toISOString()
      }
    })

    // Insert vehicles (use upsert to handle duplicates by VIN)
    const { data: insertedVehicles, error: insertError } = await supabase
      .from('vehicles')
      .upsert(validatedVehicles, {
        onConflict: 'vin',
        ignoreDuplicates: false
      })
      .select()

    if (insertError) {
      console.error('Error inserting vehicles:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported_count: insertedVehicles?.length || 0,
      vehicles: insertedVehicles || []
    })
  } catch (error: any) {
    console.error('Error in POST /api/inventory/import-csv:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/inventory/import-csv/template
// Returns a CSV template for download
export async function GET(req: NextRequest) {
  const csvTemplate = `year,make,model,trim,vin,price,miles,ext_color,int_color,features,title_status,cost,status
2021,Chevrolet,Trailblazer,LS,1GNSKJKC3MR123456,24995,25000,Black,Black,"Power windows, A/C",clean,22000,available
2020,Honda,Civic,EX,19XFC2F53LE123456,18995,45000,Silver,Gray,"Navigation, Backup camera",clean,17500,available
2019,Toyota,Camry,SE,4T1B11HK5KU123456,21995,38000,White,Beige,"Sunroof, Leather seats",clean,20000,available`

  return new NextResponse(csvTemplate, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="vehicle-import-template.csv"'
    }
  })
}

