import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('name', 'Unlimited Auto Repair & Collision LLC')
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
      status: 'incomplete',
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
