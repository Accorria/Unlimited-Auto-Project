import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { sendSMSNotificationForLead } from '@/lib/sms'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received appointment request:', {
      name: body?.name,
      email: body?.email,
      phone: body?.phone,
      appointmentDate: body?.appointmentDate,
      appointmentTime: body?.appointmentTime,
      type: body?.type
    })

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

    // Validate required fields
    if (!body.appointmentDate || !body.appointmentTime) {
      return NextResponse.json({ 
        error: 'Appointment date and time are required' 
      }, { status: 400 })
    }

    // Create appointment datetime
    const appointmentDateTime = new Date(`${body.appointmentDate}T${body.appointmentTime}`)
    const endDateTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration

    // First, find or create the lead
    let leadId = null
    if (body.leadId) {
      leadId = body.leadId
    } else if (body.email || body.phone || body.name) {
      // Try to find existing lead or create a new one
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('dealer_id', dealer.id)
        .or(`email.eq.${body.email},phone.eq.${body.phone}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingLead) {
        leadId = existingLead.id
      } else {
        // Create new lead for this appointment
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            dealer_id: dealer.id,
            name: body.name || '',
            email: body.email || '',
            phone: body.phone || '',
            source: body.source || 'appointment_request',
            status: 'new',
            consent: true,
            notes: JSON.stringify({
              appointmentRequested: true,
              vehicleInterest: body.vehicleInterest,
              service: body.service
            })
          })
          .select()
          .single()

        if (!leadError && newLead) {
          leadId = newLead.id
        }
      }
    }

    // Create appointment
    const appointmentData = {
      dealer_id: dealer.id,
      lead_id: leadId,
      vehicle_id: body.vehicleId || null,
      type: body.type || 'test_drive',
      start_at: appointmentDateTime.toISOString(),
      end_at: endDateTime.toISOString(),
      status: 'scheduled',
      location: body.location || '24645 Plymouth Rd Unit A, Redford Township, MI 48239',
      notes: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone,
        vehicleInterest: body.vehicleInterest,
        service: body.service,
        message: body.message
      })
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return NextResponse.json({ 
        error: 'Failed to create appointment',
        details: appointmentError.message 
      }, { status: 500 })
    }

    console.log('Appointment created successfully:', appointment.id)

    // Send email notification
    try {
      const appointmentDateFormatted = appointmentDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const appointmentTimeFormatted = appointmentDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })

      await sendEmail({
        to: 'unlimitedautoredford@gmail.com',
        subject: `📅 New Appointment Request: ${body.name || 'Customer'}`,
        html: `
          <h2>New Appointment Request</h2>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #155724;">📅 Appointment Details</h3>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Date:</strong> <span style="color: #333;">${appointmentDateFormatted}</span></p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Time:</strong> <span style="color: #333;">${appointmentTimeFormatted}</span></p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Type:</strong> <span style="color: #333;">${body.type || 'Test Drive'}</span></p>
          </div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800;">
            <h3 style="margin-top: 0; color: #856404;">👤 Contact Information</h3>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Name:</strong> <span style="color: #333;">${body.name || 'Not provided'}</span></p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Email:</strong> <span style="color: #333;">${body.email || 'Not provided'}</span></p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Phone:</strong> <span style="color: #333;">${body.phone || 'Not provided'}</span></p>
          </div>
          ${body.vehicleInterest ? `<p><strong>Vehicle Interest:</strong> ${body.vehicleInterest}</p>` : ''}
          ${body.service ? `<p><strong>Service:</strong> ${body.service}</p>` : ''}
          ${body.message ? `<p><strong>Message:</strong> ${body.message}</p>` : ''}
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-weight: bold; color: #155724;">✅ Please confirm this appointment with the customer!</p>
          </div>
        `
      })

      // Also send confirmation email to customer if email provided
      if (body.email) {
        await sendEmail({
          to: body.email,
          subject: `Appointment Confirmation - Unlimited Auto Repair & Collision`,
          html: `
            <h2>Your Appointment Has Been Requested</h2>
            <p>Thank you for scheduling with Unlimited Auto Repair & Collision!</p>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
              <h3 style="margin-top: 0; color: #155724;">📅 Your Appointment</h3>
              <p style="font-size: 16px; margin: 10px 0;"><strong>Date:</strong> ${appointmentDateFormatted}</p>
              <p style="font-size: 16px; margin: 10px 0;"><strong>Time:</strong> ${appointmentTimeFormatted}</p>
              <p style="font-size: 16px; margin: 10px 0;"><strong>Location:</strong> 24645 Plymouth Rd Unit A, Redford Township, MI 48239</p>
            </div>
            <p>We'll reach out to confirm your appointment. If you need to reschedule, please call us at (313) 766-4475.</p>
            <p>We look forward to serving you!</p>
          `
        })
      }

      console.log('✅ Appointment notification emails sent successfully')
    } catch (emailError: any) {
      console.error('❌ Error sending appointment emails:', emailError)
      // Don't fail the request if email fails
    }

    // Send SMS notifications to configured phone numbers
    if (leadId) {
      try {
        const { data: lead } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single()

        if (lead) {
          const { data: dealerWithPhones } = await supabase
            .from('dealers')
            .select('sms_phone_numbers')
            .eq('id', dealer.id)
            .single()

          if (dealerWithPhones?.sms_phone_numbers) {
            const phoneNumbers = Array.isArray(dealerWithPhones.sms_phone_numbers) 
              ? dealerWithPhones.sms_phone_numbers 
              : []
            
            if (phoneNumbers.length > 0) {
              await sendSMSNotificationForLead(lead, phoneNumbers)
              console.log('✅ SMS notifications sent to', phoneNumbers.length, 'phone number(s)')
            }
          }
        }
      } catch (smsError: any) {
        console.error('❌ Error sending SMS notifications:', smsError)
        // Don't fail the request if SMS fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      appointmentId: appointment.id,
      message: 'Appointment requested successfully. We\'ll confirm with you shortly!' 
    })

  } catch (error: any) {
    console.error('Appointment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

