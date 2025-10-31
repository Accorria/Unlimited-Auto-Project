import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET(req: NextRequest) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

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

    // Build query with optional status filter
    let query = supabase
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

    // Transform the data to match the expected format
    const transformedLeads = (leads as any[]).map((lead: any) => ({
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
        vehicleId: body.vehicleId,
        source: body.source,
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
    
        // Send email notification to dealer
        if (resend) {
          try {
            console.log('Attempting to send email notification via Resend...')
            const emailResult = await resend.emails.send({
              from: 'Unlimited Auto <onboarding@resend.dev>',
              to: 'unlimitedautoredford@gmail.com',
              subject: `New Lead from ${lead.name} - Unlimited Auto`,
              html: `
                <h2>New Lead Received!</h2>
                <p><strong>Name:</strong> ${lead.name}</p>
                <p><strong>Email:</strong> ${lead.email}</p>
                <p><strong>Phone:</strong> ${lead.phone}</p>
                <p><strong>Message:</strong> ${lead.message || 'N/A'}</p>
                <p><strong>Service:</strong> ${body.service || 'N/A'}</p>
                <p><strong>Vehicle Interest:</strong> ${body.vehicleInterest || 'N/A'}</p>
                <p><strong>Vehicle ID:</strong> ${body.vehicleId || 'N/A'}</p>
                <p><strong>Source:</strong> ${body.source === 'vehicle_page' ? '🚗 Vehicle Page (Website)' : body.source === 'contact_form' ? '📝 Contact Form (Website)' : '🌐 Website'}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p><em>This lead came from the website, not Google search.</em></p>
              `,
            })
            console.log('✅ Email notification sent successfully:', emailResult)
          } catch (emailError: any) {
            console.error('❌ Error sending email notification:', emailError)
            console.error('Error details:', emailError.message, emailError.stack)
            // Continue even if email fails
          }
        } else {
          console.warn('⚠️ Resend API key not configured - RESEND_API_KEY missing or invalid')
          console.warn('Current RESEND_API_KEY status:', process.env.RESEND_API_KEY ? 'Set (but Resend not initialized)' : 'Not set')
        }

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
