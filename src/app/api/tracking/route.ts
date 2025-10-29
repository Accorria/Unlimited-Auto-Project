import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('📊 Tracking event received:', body)

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

    // Create tracking record
    const trackingData = {
      dealer_id: dealer.id,
      event_type: body.eventType,
      url: body.url,
      referrer: body.referrer,
      user_agent: body.userAgent,
      details: body.details || {},
      timestamp: body.timestamp || new Date().toISOString()
    }

    // Insert tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('tracking_events')
      .insert(trackingData)
      .select()
      .single()

    if (trackingError) {
      console.error('Error inserting tracking event:', trackingError)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }

    // Send email notification to unlimitedautosales@gmail.com
    try {
      await sendEmail({
        to: 'unlimitedautosales@gmail.com',
        subject: `🚗 New ${body.eventType} from your website`,
        html: `
          <h2>New ${body.eventType} from your website</h2>
          <p><strong>URL:</strong> ${body.url}</p>
          <p><strong>Referrer:</strong> ${body.referrer || 'Direct'}</p>
          <p><strong>Details:</strong></p>
          <pre>${JSON.stringify(body.details || {}, null, 2)}</pre>
          <p><strong>Timestamp:</strong> ${body.timestamp || new Date().toISOString()}</p>
        `
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the tracking if email fails
    }

    console.log('✅ Tracking event recorded:', tracking.id)
    return NextResponse.json({ success: true, trackingId: tracking.id })

  } catch (error: any) {
    console.error('Tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendTrackingNotification(trackingData: any, dealer: any) {
  try {
    // Import Resend for email sending
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const eventTypeLabels = {
      'phone_click': '📞 Phone Click',
      'email_click': '📧 Email Click', 
      'form_submit': '📝 Form Submit',
      'page_view': '👁️ Page View',
      'vehicle_interest': '🚗 Vehicle Interest'
    }

    const sourceLabels = {
      'inventory_page': 'Inventory Page',
      'contact_page': 'Contact Page',
      'finance_page': 'Finance Page',
      'vehicle_detail': 'Vehicle Detail',
      'footer': 'Footer',
      'header': 'Header',
      'hero_section': 'Hero Section'
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚗 UNLIMITED AUTO - CUSTOMER INTERACTION</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Real-time funnel tracking notification</p>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">${eventTypeLabels[trackingData.event_type as keyof typeof eventTypeLabels] || trackingData.event_type}</h2>
            
            <div style="display: grid; gap: 15px;">
              <div>
                <strong>Source:</strong> ${sourceLabels[trackingData.source as keyof typeof sourceLabels] || trackingData.source}
              </div>
              
              ${trackingData.vehicle_name ? `
                <div>
                  <strong>Vehicle:</strong> ${trackingData.vehicle_name}
                </div>
              ` : ''}
              
              <div>
                <strong>Session ID:</strong> ${trackingData.session_id}
              </div>
              
              <div>
                <strong>Time:</strong> ${new Date(trackingData.created_at).toLocaleString()}
              </div>
              
              <div>
                <strong>IP Address:</strong> ${trackingData.ip_address || 'Unknown'}
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px;">
              <h3 style="margin-top: 0; color: #374151;">🎯 Action Required</h3>
              <p style="margin: 5px 0;">This customer is showing interest in your business. Consider reaching out proactively!</p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://yourdomain.com/admin/leads" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View All Leads
              </a>
            </div>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This notification was sent because a customer interacted with your website.</p>
          <p>Generated by Unlimited Auto Funnel System</p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: 'Unlimited Auto Funnel <noreply@unlimitedauto.com>',
      to: ['unlimitedautosales@gmail.com'],
      subject: `🚗 Customer Interaction: ${eventTypeLabels[trackingData.event_type as keyof typeof eventTypeLabels] || trackingData.event_type}`,
      html: emailHtml,
    })

    console.log('📧 Tracking notification sent to unlimitedautosales@gmail.com')
  } catch (error) {
    console.error('Error sending tracking notification:', error)
  }
}
