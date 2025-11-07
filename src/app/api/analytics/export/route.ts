import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    
    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
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

    // Get all tracking events
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

    // Convert to CSV format
    const csvHeaders = [
      'Timestamp',
      'Event Type',
      'URL',
      'Path',
      'Referrer',
      'Element Type',
      'Element Text',
      'Element ID',
      'Element Class',
      'Href',
      'Click X',
      'Click Y',
      'Page X',
      'Page Y',
      'Viewport Width',
      'Viewport Height',
      'User Agent',
      'IP Address'
    ]

    // Build CSV rows
    const csvRows = trackingEvents?.map(event => {
      const details = event.details || {}
      const position = details.position || {}
      
      return [
        event.created_at || event.timestamp || '',
        event.event_type || '',
        event.url || '',
        details.path || '',
        event.referrer || '',
        details.elementType || '',
        (details.elementText || '').replace(/"/g, '""'), // Escape quotes for CSV
        details.elementId || '',
        (details.elementClass || '').replace(/"/g, '""'),
        details.href || '',
        position.x || '',
        position.y || '',
        position.pageX || '',
        position.pageY || '',
        position.viewportWidth || '',
        position.viewportHeight || '',
        (event.user_agent || '').replace(/"/g, '""'),
        event.ip_address || ''
      ]
    }) || []

    // Create CSV content
    const csvContent = [
      csvHeaders.map(h => `"${h}"`).join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="click-tracking-${timeRange}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error: any) {
    console.error('Export API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

