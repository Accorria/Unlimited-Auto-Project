import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

// GET /api/analytics/lead-source-roi?dealerId=xxx&startDate=xxx&endDate=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const dealerId = searchParams.get('dealerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    // Build date filter
    let dateFilter = supabase
      .from('leads')
      .select('*')
      .eq('dealer_id', dealerId)

    if (startDate) {
      dateFilter = dateFilter.gte('created_at', startDate)
    }
    if (endDate) {
      dateFilter = dateFilter.lte('created_at', endDate)
    }

    const { data: leads, error: leadsError } = await dateFilter

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: leadsError.message }, { status: 500 })
    }

    // Group leads by source
    const sourceGroups: Record<string, any> = {}

    ;(leads || []).forEach(lead => {
      const source = lead.source || 'unknown'
      const utmSource = lead.utm_source || 'none'
      const utmMedium = lead.utm_medium || 'none'
      
      // Create source key: source + utm_source + utm_medium
      const sourceKey = `${source}|${utmSource}|${utmMedium}`

      if (!sourceGroups[sourceKey]) {
        sourceGroups[sourceKey] = {
          source,
          utm_source: utmSource,
          utm_medium: utmMedium,
          total_leads: 0,
          set_count: 0,
          show_count: 0,
          close_count: 0,
          total_revenue: 0
        }
      }

      const group = sourceGroups[sourceKey]
      group.total_leads++
      if (lead.status === 'set') group.set_count++
      if (lead.status === 'show') group.show_count++
      if (lead.status === 'close') {
        group.close_count++
        group.total_revenue += lead.close_amount || 0
      }
    })

    // Calculate ROI metrics for each source
    const roiData = Object.values(sourceGroups).map((group: any) => {
      const setRate = group.total_leads > 0 
        ? (group.set_count / group.total_leads) * 100 
        : 0
      const showRate = group.set_count > 0 
        ? (group.show_count / group.set_count) * 100 
        : 0
      const closeRate = group.show_count > 0 
        ? (group.close_count / group.show_count) * 100 
        : 0
      const overallConvRate = group.total_leads > 0 
        ? (group.close_count / group.total_leads) * 100 
        : 0
      const avgRevenuePerClose = group.close_count > 0 
        ? group.total_revenue / group.close_count 
        : 0

      return {
        ...group,
        set_rate: Math.round(setRate * 100) / 100,
        show_rate: Math.round(showRate * 100) / 100,
        close_rate: Math.round(closeRate * 100) / 100,
        overall_conv_rate: Math.round(overallConvRate * 100) / 100,
        avg_revenue_per_close: Math.round(avgRevenuePerClose * 100) / 100
      }
    })

    // Sort by total leads (descending)
    roiData.sort((a, b) => b.total_leads - a.total_leads)

    return NextResponse.json({ roi_data: roiData })
  } catch (error: any) {
    console.error('Error in GET /api/analytics/lead-source-roi:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

