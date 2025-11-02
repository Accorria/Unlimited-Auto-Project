import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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

    // Create appointment if date/time provided
    if (body.appointmentDate && body.appointmentTime) {
      try {
        const appointmentDateTime = new Date(`${body.appointmentDate}T${body.appointmentTime}`)
        const endDateTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration

        const appointmentData = {
          dealer_id: dealer.id,
          lead_id: lead.id,
          vehicle_id: body.vehicleInterest || null,
          type: 'test_drive',
          start_at: appointmentDateTime.toISOString(),
          end_at: endDateTime.toISOString(),
          status: 'scheduled',
          location: '24645 Plymouth Rd Unit A, Redford Township, MI 48239',
          notes: JSON.stringify({
            vehicleInterest: body.vehicleInterest
          })
        }

        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .insert(appointmentData)
          .select()
          .single()

        if (!appointmentError && appointment) {
          console.log('Appointment created successfully:', appointment.id)
        }
      } catch (appointmentErr) {
        console.error('Error creating appointment:', appointmentErr)
        // Don't fail the application submission if appointment creation fails
      }
    }
    
        // Send email notification to dealer
        if (resend) {
          try {
            console.log('Attempting to send financing application email via Resend...')
            const emailResult = await resend.emails.send({
              from: 'Unlimited Auto <onboarding@resend.dev>',
              to: 'unlimitedautoredford@gmail.com',
              subject: `New Pre-approval Application from ${lead.name} - Unlimited Auto`,
        html: `
          <h2>New Pre-approval Application Received!</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          <p><strong>Address:</strong> ${lead.address || 'N/A'}</p>
          <p><strong>City:</strong> ${lead.city || 'N/A'}</p>
          <p><strong>State:</strong> ${lead.state || 'N/A'}</p>
          <p><strong>Zip:</strong> ${lead.zip_code || 'N/A'}</p>
          <p><strong>Employment Status:</strong> ${body.employment || lead.employer || 'N/A'}</p>
          <p><strong>Monthly Income:</strong> ${body.income || lead.income || 'N/A'}</p>
          <p><strong>Net Monthly Income:</strong> ${lead.net_monthly_income ? `$${lead.net_monthly_income.toLocaleString()}` : 'N/A'}</p>
          <p><strong>Down Payment:</strong> ${body.downPayment || (lead.down_payment ? `$${lead.down_payment.toLocaleString()}` : 'N/A')}</p>
          <p><strong>Credit Score:</strong> ${body.creditScore || lead.credit_score || 'N/A'}</p>
          <p><strong>Vehicle of Interest:</strong> ${body.vehicleInterest || lead.message || 'N/A'}</p>
          ${body.appointmentDate && body.appointmentTime ? `
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #155724;">📅 Test Drive Appointment Requested</h3>
            <p><strong>Date:</strong> ${new Date(body.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${new Date(`2000-01-01T${body.appointmentTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
          </div>
          ` : ''}
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `,
      })
            console.log('✅ Email notification sent successfully:', emailResult)
          } catch (emailError: any) {
            console.error('❌ Error sending credit application email notification:', emailError)
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
      message: 'Application submitted successfully! We\'ll contact you within 24 hours.' 
    })

  } catch (error: any) {
    console.error('Financing API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
