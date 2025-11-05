import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

// GET /api/analytics/scoreboard?dealerId=xxx&startDate=xxx&endDate=xxx
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

    // Get all users for this dealer
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('dealer_id', dealerId)
      .eq('is_active', true)
      .in('role', ['sales_rep', 'sales_manager'])

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Calculate scoreboard for each user
    const scoreboard = (users || []).map(user => {
      const userLeads = (leads || []).filter(
        lead => lead.assigned_to === user.id
      )

      const total = userLeads.length
      const setCount = userLeads.filter(l => l.status === 'set').length
      const showCount = userLeads.filter(l => l.status === 'show').length
      const closeCount = userLeads.filter(l => l.status === 'close').length

      // Calculate conversion rates
      const setRate = total > 0 ? (setCount / total) * 100 : 0
      const showRate = setCount > 0 ? (showCount / setCount) * 100 : 0
      const closeRate = showCount > 0 ? (closeCount / showCount) * 100 : 0
      const overallConvRate = total > 0 ? (closeCount / total) * 100 : 0

      // Calculate average response time
      const respondedLeads = userLeads.filter(l => l.first_response_at)
      const avgResponseTime = respondedLeads.length > 0
        ? respondedLeads.reduce((sum, l) => sum + (l.response_time_minutes || 0), 0) / respondedLeads.length
        : 0

      return {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        user_role: user.role,
        total_leads: total,
        set_count: setCount,
        show_count: showCount,
        close_count: closeCount,
        set_rate: Math.round(setRate * 100) / 100,
        show_rate: Math.round(showRate * 100) / 100,
        close_rate: Math.round(closeRate * 100) / 100,
        overall_conv_rate: Math.round(overallConvRate * 100) / 100,
        avg_response_time_minutes: Math.round(avgResponseTime * 100) / 100
      }
    })

    // Sort by overall conversion rate (descending)
    scoreboard.sort((a, b) => b.overall_conv_rate - a.overall_conv_rate)

    return NextResponse.json({ scoreboard })
  } catch (error: any) {
    console.error('Error in GET /api/analytics/scoreboard:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

