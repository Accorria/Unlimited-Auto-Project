import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    
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

    // Calculate time filter
    const now = new Date()
    let timeFilter = new Date()
    
    switch (timeRange) {
      case '1h':
        timeFilter.setHours(now.getHours() - 1)
        break
      case '24h':
        timeFilter.setDate(now.getDate() - 1)
        break
      case '7d':
        timeFilter.setDate(now.getDate() - 7)
        break
      case '30d':
        timeFilter.setDate(now.getDate() - 30)
        break
      default:
        timeFilter.setDate(now.getDate() - 1)
    }

    // Get tracking events
    const { data: trackingEvents, error: trackingError } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('dealer_id', dealer.id)
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })

    if (trackingError) {
      console.error('Error fetching tracking events:', trackingError)
      return NextResponse.json({ error: 'Failed to fetch tracking events' }, { status: 500 })
    }

    // Calculate tracking analytics
    const totalEvents = trackingEvents?.length || 0
    const phoneClicks = trackingEvents?.filter(e => e.event_type === 'phone_click').length || 0
    const emailClicks = trackingEvents?.filter(e => e.event_type === 'email_click').length || 0
    const formSubmissions = trackingEvents?.filter(e => e.event_type === 'form_submit').length || 0
    const pageViews = trackingEvents?.filter(e => e.event_type === 'page_view').length || 0
    const vehicleInterests = trackingEvents?.filter(e => e.event_type === 'vehicle_interest').length || 0

    // Events by source
    const eventsBySource = trackingEvents?.reduce((acc, event) => {
      acc[event.source] = (acc[event.source] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Events by hour
    const eventsByHour = trackingEvents?.reduce((acc, event) => {
      const hour = new Date(event.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Top vehicles
    const vehicleCounts = trackingEvents?.reduce((acc, event) => {
      if (event.vehicle_name) {
        acc[event.vehicle_name] = (acc[event.vehicle_name] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    const topVehicles = Object.entries(vehicleCounts)
      .map(([vehicle_name, count]) => ({ vehicle_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent events (last 20)
    const recentEvents = trackingEvents?.slice(0, 20) || []

    // Get total leads count
    const { count: totalLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)

    if (leadsError) {
      console.error('Error fetching leads count:', leadsError)
      // Return default analytics if no leads exist yet
      return NextResponse.json({
        success: true,
        analytics: {
          eligible_unique_leads: 0,
          set_rate: 0,
          show_rate: 0,
          close_rate: 0,
          overall_close_rate: 0,
          time_to_first_response: 0,
          leads_by_status: { new: 0, set: 0, show: 0, close: 0 },
          leads_by_source: {},
          leads_by_agent: {},
          recent_leads: []
        }
      })
    }

    // Get leads by status
    const { data: leadsByStatus, error: statusError } = await supabase
      .from('leads')
      .select('status')
      .eq('dealer_id', dealer.id)

    if (statusError) {
      console.error('Error fetching leads by status:', statusError)
      return NextResponse.json({ error: 'Failed to fetch leads by status' }, { status: 500 })
    }

    // Calculate SmartPath KPIs
    const statusCounts = leadsByStatus.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const eligibleUniqueLeads = totalLeads || 0
    const appointmentsSet = statusCounts['set'] || 0
    const appointmentsShown = statusCounts['show'] || 0
    const dealsClosed = statusCounts['close'] || 0

    // Calculate rates
    const setRate = eligibleUniqueLeads > 0 ? appointmentsSet / eligibleUniqueLeads : 0
    const showRate = appointmentsSet > 0 ? appointmentsShown / appointmentsSet : 0
    const closeRate = appointmentsShown > 0 ? dealsClosed / appointmentsShown : 0
    const overallCloseRate = eligibleUniqueLeads > 0 ? dealsClosed / eligibleUniqueLeads : 0

    // Get leads by source
    const { data: leadsBySource, error: sourceError } = await supabase
      .from('leads')
      .select('source')
      .eq('dealer_id', dealer.id)

    if (sourceError) {
      console.error('Error fetching leads by source:', sourceError)
      return NextResponse.json({ error: 'Failed to fetch leads by source' }, { status: 500 })
    }

    const sourceCounts = leadsBySource.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get leads by agent
    const { data: leadsByAgent, error: agentError } = await supabase
      .from('leads')
      .select('agent')
      .eq('dealer_id', dealer.id)

    if (agentError) {
      console.error('Error fetching leads by agent:', agentError)
      return NextResponse.json({ error: 'Failed to fetch leads by agent' }, { status: 500 })
    }

    const agentCounts = leadsByAgent.reduce((acc, lead) => {
      const agent = lead.agent || 'unassigned'
      acc[agent] = (acc[agent] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get recent leads
    const { data: recentLeads, error: recentError } = await supabase
      .from('leads')
      .select(`
        id,
        name,
        phone,
        email,
        source,
        agent,
        status,
        created_at,
        updated_at
      `)
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('Error fetching recent leads:', recentError)
      return NextResponse.json({ error: 'Failed to fetch recent leads' }, { status: 500 })
    }

    // Calculate Time-to-First-Response (mock for now - would need message timestamps)
    const avgTTFR = 2.5 // minutes - would calculate from actual message data

    // Return comprehensive analytics including tracking data
    return NextResponse.json({
      success: true,
      analytics: {
        // Tracking Analytics
        total_events: totalEvents,
        phone_clicks: phoneClicks,
        email_clicks: emailClicks,
        form_submissions: formSubmissions,
        page_views: pageViews,
        vehicle_interests: vehicleInterests,
        events_by_source: eventsBySource,
        events_by_hour: eventsByHour,
        top_vehicles: topVehicles,
        recent_events: recentEvents,
        
        // Lead Analytics (existing)
        eligible_unique_leads: eligibleUniqueLeads,
        set_rate: setRate,
        show_rate: showRate,
        close_rate: closeRate,
        overall_close_rate: overallCloseRate,
        time_to_first_response: avgTTFR,
        
        // Breakdown by status
        leads_by_status: {
          new: statusCounts['new'] || 0,
          set: statusCounts['set'] || 0,
          show: statusCounts['show'] || 0,
          close: statusCounts['close'] || 0
        },
        
        // Source attribution
        leads_by_source: sourceCounts,
        
        // Agent performance
        leads_by_agent: agentCounts,
        
        // Recent activity
        recent_leads: recentLeads || []
      }
    })

  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}
