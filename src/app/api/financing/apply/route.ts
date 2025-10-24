import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received financing application:', body)

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        missingFields 
      }, { status: 400 })
    }

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
      
      // Contact information
      name: `${body.firstName} ${body.lastName}`.trim(),
      phone: body.phone,
      email: body.email,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zip_code: body.zip || null,
      message: body.vehicleInterest || null,
      
      // Financial information
      income: body.income || null,
      net_monthly_income: body.income ? parseFloat(body.income.replace(/[^0-9.]/g, '')) : null,
      employer: body.employment || null,
      down_payment: body.downPayment ? parseInt(body.downPayment.replace(/[^0-9]/g, '')) : null,
      credit_score: body.creditScore ? parseInt(body.creditScore) : null,
      
      // Attribution tracking
      source: 'website',
      status: 'new',
      consent: true, // Assuming they consent by submitting the form
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the financing application as a lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (leadError) {
      console.error('Error inserting lead:', leadError)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    console.log('Financing application submitted successfully:', lead)
    
    // Send email notification to dealer
    try {
      await resend.emails.send({
        from: 'noreply@unlimitedauto.com', // You'll need to verify this domain
        to: 'unlimitedautoredford@gmail.com',
        subject: `New Credit Application from ${lead.name} - Unlimited Auto`,
        html: `
          <h2>New Credit Application Received!</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          <p><strong>Address:</strong> ${lead.address || 'N/A'}</p>
          <p><strong>City:</strong> ${lead.city || 'N/A'}</p>
          <p><strong>State:</strong> ${lead.state || 'N/A'}</p>
          <p><strong>Zip:</strong> ${lead.zip_code || 'N/A'}</p>
          <p><strong>Income:</strong> ${lead.income || 'N/A'}</p>
          <p><strong>Net Monthly Income:</strong> ${lead.net_monthly_income || 'N/A'}</p>
          <p><strong>Employer:</strong> ${lead.employer || 'N/A'}</p>
          <p><strong>Months on Job:</strong> ${lead.months_on_job || 'N/A'}</p>
          <p><strong>Down Payment:</strong> ${lead.down_payment || 'N/A'}</p>
          <p><strong>Credit Score:</strong> ${lead.credit_score || 'N/A'}</p>
          <p><strong>Vehicle Interest:</strong> ${lead.vehicle_interest || 'N/A'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `,
      })
      console.log('Credit application email notification sent successfully')
    } catch (emailError) {
      console.error('Error sending credit application email notification:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Application submitted successfully! We\'ll contact you within 24 hours.' 
    })

  } catch (error: any) {
    console.error('Financing API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
