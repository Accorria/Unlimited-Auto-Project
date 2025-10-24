import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
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

    // Fetch leads for this dealer
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        id,
        dealer_id,
        vehicle_id,
        assigned_to,
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
        down_payment_ratio,
        credit_score,
        source,
        agent,
        utm_source,
        utm_medium,
        utm_campaign,
        gclid,
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
        updated_at,
        status_updated_at
      `)
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false })

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      dealer_id: lead.dealer_id,
      vehicle_id: lead.vehicle_id,
      assigned_to: lead.assigned_to,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zip_code: lead.zip_code,
      message: lead.message,
      income: lead.income,
      net_monthly_income: lead.net_monthly_income,
      employer: lead.employer,
      months_on_job: lead.months_on_job,
      dl_state: lead.dl_state,
      down_payment: lead.down_payment,
      down_payment_ratio: lead.down_payment_ratio,
      credit_score: lead.credit_score,
      source: lead.source,
      agent: lead.agent,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      gclid: lead.gclid,
      status: lead.status,
      notes: lead.notes,
      consent: lead.consent,
      follow_up_date: lead.follow_up_date,
      follow_up_notes: lead.follow_up_notes,
      last_contact_date: lead.last_contact_date,
      close_date: lead.close_date,
      close_amount: lead.close_amount,
      commission_amount: lead.commission_amount,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      status_updated_at: lead.status_updated_at
    }))

    return NextResponse.json({ 
      success: true, 
      leads: transformedLeads,
      count: transformedLeads.length
    })

  } catch (error: any) {
    console.error('Leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received lead:', {
      name: body?.name,
      phone: body?.phone,
      email: body?.email,
      source: body?.source,
      message: body?.message
    })

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

    // Prepare lead data
    const leadData = {
      dealer_id: dealer.id,
      name: body.name || '',
      phone: body.phone || '',
      email: body.email || '',
      message: body.message || '',
      source: body.source || 'website',
      status: 'new',
      consent: body.consent || false,
      notes: JSON.stringify({
        service: body.service,
        vehicleInterest: body.vehicleInterest,
        submittedAt: new Date().toISOString()
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (leadError) {
      console.error('Error inserting lead:', leadError)
      return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
    }

    console.log('Lead submitted successfully:', lead.id)
    
    // TODO: Send email notification to dealer
    // TODO: Send confirmation email to customer
    // TODO: Integrate with CRM system

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Lead submitted successfully!' 
    })

  } catch (error: any) {
    console.error('Lead submission API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
