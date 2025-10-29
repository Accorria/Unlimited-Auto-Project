import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Use service role client to bypass RLS
    const supabase = createServerClient()
    
    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      console.error('Dealer not found:', dealerError)
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Create incomplete lead data
    const leadData = {
      dealer_id: dealer.id,
      
      // Contact information (if provided)
      name: body.name || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zip_code: body.zip || null,
      message: body.message || null,
      
      // Financial information (if provided)
      income: body.income || null,
      net_monthly_income: body.income ? parseFloat(body.income.replace(/[^0-9.]/g, '')) : null,
      employer: body.employment || null,
      down_payment: body.downPayment ? parseInt(body.downPayment.replace(/[^0-9]/g, '')) : null,
      credit_score: body.creditScore ? parseInt(body.creditScore) : null,
      
      // Attribution tracking
      source: 'website_incomplete',
      status: 'new',
      consent: false, // They didn't complete the form
      
      // Track what they filled out
      notes: JSON.stringify({
        incompleteApplication: true,
        formStep: body.formStep || 'unknown',
        fieldsCompleted: body.fieldsCompleted || [],
        lastActivity: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        referer: req.headers.get('referer')
      }),
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the incomplete lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (leadError) {
      console.error('Error inserting incomplete lead:', leadError)
      return NextResponse.json({ error: 'Failed to track lead' }, { status: 500 })
    }

    console.log('Incomplete lead tracked successfully:', lead.id)
    
    // Send email notification for incomplete leads with contact info
    if (body.firstName || body.phone || body.email) {
      await sendEmail({
        to: 'unlimitedautosales@gmail.com',
        subject: `🚨 Incomplete Lead: ${body.firstName || 'Unknown'}`,
        html: `
          <h2>Incomplete Lead Captured</h2>
          <p><strong>Name:</strong> ${body.firstName || 'Unknown'}</p>
          <p><strong>Phone:</strong> ${body.phone || 'No phone'}</p>
          <p><strong>Email:</strong> ${body.email || 'No email'}</p>
          <p><strong>Form Type:</strong> ${body.formStep || 'Unknown form'}</p>
          <p><strong>Source:</strong> ${body.source || 'Website'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><em>This person started filling out a form but didn't complete it. Follow up with them!</em></p>
        `
      })
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Lead tracked successfully' 
    })

  } catch (error: any) {
    console.error('Lead tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
