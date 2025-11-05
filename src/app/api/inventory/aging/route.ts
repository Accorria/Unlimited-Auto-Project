import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

// GET /api/inventory/aging?dealerId=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const dealerId = searchParams.get('dealerId')

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    // Get all vehicles for this dealer
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, vin, year, make, model, price, days_on_lot, first_listed_at, created_at, status')
      .eq('dealer_id', dealerId)
      .in('status', ['available', 'active'])

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Categorize by aging buckets
    const agingReport = {
      '0-15': [] as any[],
      '16-30': [] as any[],
      '31-60': [] as any[],
      '60+': [] as any[]
    }

    ;(vehicles || []).forEach(vehicle => {
      const daysOnLot = vehicle.days_on_lot || 0
      
      if (daysOnLot <= 15) {
        agingReport['0-15'].push(vehicle)
      } else if (daysOnLot <= 30) {
        agingReport['16-30'].push(vehicle)
      } else if (daysOnLot <= 60) {
        agingReport['31-60'].push(vehicle)
      } else {
        agingReport['60+'].push(vehicle)
      }
    })

    // Calculate summary statistics
    const summary = {
      '0-15': {
        count: agingReport['0-15'].length,
        total_value: agingReport['0-15'].reduce((sum, v) => sum + (v.price || 0), 0),
        avg_price: agingReport['0-15'].length > 0
          ? agingReport['0-15'].reduce((sum, v) => sum + (v.price || 0), 0) / agingReport['0-15'].length
          : 0
      },
      '16-30': {
        count: agingReport['16-30'].length,
        total_value: agingReport['16-30'].reduce((sum, v) => sum + (v.price || 0), 0),
        avg_price: agingReport['16-30'].length > 0
          ? agingReport['16-30'].reduce((sum, v) => sum + (v.price || 0), 0) / agingReport['16-30'].length
          : 0
      },
      '31-60': {
        count: agingReport['31-60'].length,
        total_value: agingReport['31-60'].reduce((sum, v) => sum + (v.price || 0), 0),
        avg_price: agingReport['31-60'].length > 0
          ? agingReport['31-60'].reduce((sum, v) => sum + (v.price || 0), 0) / agingReport['31-60'].length
          : 0
      },
      '60+': {
        count: agingReport['60+'].length,
        total_value: agingReport['60+'].reduce((sum, v) => sum + (v.price || 0), 0),
        avg_price: agingReport['60+'].length > 0
          ? agingReport['60+'].reduce((sum, v) => sum + (v.price || 0), 0) / agingReport['60+'].length
          : 0
      }
    }

    return NextResponse.json({
      aging_report: agingReport,
      summary
    })
  } catch (error: any) {
    console.error('Error in GET /api/inventory/aging:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

