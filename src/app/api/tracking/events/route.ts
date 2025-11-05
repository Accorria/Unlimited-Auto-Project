import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { TrackingEvent } from '@/lib/types'

// POST /api/tracking/events
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { 
      dealerId, 
      leadId, 
      vehicleId, 
      eventType, 
      eventData 
    } = body

    if (!dealerId || !eventType) {
      return NextResponse.json(
        { error: 'dealerId and eventType are required' },
        { status: 400 }
      )
    }

    // Get IP address and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    const eventDataToInsert: any = {
      dealer_id: dealerId,
      lead_id: leadId || null,
      vehicle_id: vehicleId || null,
      event_type: eventType,
      event_data: eventData || {},
      ip_address: ipAddress,
      user_agent: userAgent
    }

    const { data: event, error } = await supabase
      .from('tracking_events')
      .insert(eventDataToInsert)
      .select()
      .single()

    if (error) {
      console.error('Error creating tracking event:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error: any) {
    console.error('Error in POST /api/tracking/events:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/tracking/events?leadId=xxx&vehicleId=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const leadId = searchParams.get('leadId')
    const vehicleId = searchParams.get('vehicleId')
    const dealerId = searchParams.get('dealerId')

    let query = supabase
      .from('tracking_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }
    if (dealerId) {
      query = query.eq('dealer_id', dealerId)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching tracking events:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events: events || [] })
  } catch (error: any) {
    console.error('Error in GET /api/tracking/events:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

