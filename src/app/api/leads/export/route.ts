import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const format = searchParams.get('format') || 'csv'

    // Get the dealer ID
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('leads')
      .select(`
        id,
        name,
        phone,
        email,
        address,
        city,
        state,
        zip_code,
        message,
        income,
        net_monthly_income,
        employer,
        months_on_job,
        dl_state,
        down_payment,
        credit_score,
        source,
        agent,
        utm_source,
        utm_medium,
        utm_campaign,
        status,
        notes,
        consent,
        follow_up_date,
        follow_up_notes,
        last_contact_date,
        close_date,
        close_amount,
        commission_amount,
        created_at,
        updated_at
      `)
      .eq('dealer_id', dealer.id)

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data: leads, error: leadsError } = await query

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'ID',
        'Name',
        'Phone',
        'Email',
        'Address',
        'City',
        'State',
        'ZIP Code',
        'Message',
        'Income',
        'Net Monthly Income',
        'Employer',
        'Months on Job',
        'DL State',
        'Down Payment',
        'Credit Score',
        'Source',
        'Agent',
        'UTM Source',
        'UTM Medium',
        'UTM Campaign',
        'Status',
        'Notes',
        'Consent',
        'Follow Up Date',
        'Follow Up Notes',
        'Last Contact Date',
        'Close Date',
        'Close Amount',
        'Commission Amount',
        'Created At',
        'Updated At'
      ]

      // Convert leads to CSV rows
      const csvRows = leads.map(lead => [
        lead.id || '',
        lead.name || '',
        lead.phone || '',
        lead.email || '',
        lead.address || '',
        lead.city || '',
        lead.state || '',
        lead.zip_code || '',
        (lead.message || '').replace(/"/g, '""'), // Escape quotes
        lead.income || '',
        lead.net_monthly_income || '',
        lead.employer || '',
        lead.months_on_job || '',
        lead.dl_state || '',
        lead.down_payment || '',
        lead.credit_score || '',
        lead.source || '',
        lead.agent || '',
        lead.utm_source || '',
        lead.utm_medium || '',
        lead.utm_campaign || '',
        lead.status || '',
        (lead.notes || '').replace(/"/g, '""'), // Escape quotes
        lead.consent ? 'Yes' : 'No',
        lead.follow_up_date || '',
        (lead.follow_up_notes || '').replace(/"/g, '""'), // Escape quotes
        lead.last_contact_date || '',
        lead.close_date || '',
        lead.close_amount || '',
        lead.commission_amount || '',
        lead.created_at || '',
        lead.updated_at || ''
      ])

      // Create CSV content
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Return CSV file
      const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } else {
      // Return JSON
      return NextResponse.json({ leads }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  } catch (error) {
    console.error('Error exporting leads:', error)
    return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 })
  }
}

