import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, sendSMSNotification } from '@/lib/sms'
import { normalizePhoneToE164 } from '@/lib/phone'
import { createServerClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, message, leadId, reassignLead } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json({ 
        error: 'Phone number (to) is required' 
      }, { status: 400 })
    }

    // Normalize phone number to E.164 format
    const normalizedPhone = normalizePhoneToE164(to)
    if (!normalizedPhone) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Must be in E.164 format (e.g., +13137664475)' 
      }, { status: 400 })
    }

    // If message is provided, use it directly; otherwise format from leadId
    let smsMessage = message

    if (!smsMessage && leadId) {
      // Fetch lead details from database
      const supabase = createServerClient()
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (!leadError && lead) {
        const vehicleInfo = lead.vehicle_id ? `\n🚗 Vehicle ID: ${lead.vehicle_id}` : ''
        const adminUrl = process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads?lead=${lead.id}`
          : 'Check admin dashboard'
        
        smsMessage = `🚗 New Lead: ${lead.name || 'Unknown'}
📞 Phone: ${lead.phone || 'Not provided'}
📧 Email: ${lead.email || 'Not provided'}${vehicleInfo}
🔗 View: ${adminUrl}`
      } else {
        smsMessage = `🚗 New Lead Notification\nCheck your admin dashboard for details.`
      }
    }

    if (!smsMessage) {
      return NextResponse.json({ 
        error: 'Message is required' 
      }, { status: 400 })
    }

    // Send SMS
    const result = await sendSMS(normalizedPhone, smsMessage)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to send SMS' 
      }, { status: 500 })
    }

    // Optionally reassign lead if requested
    if (reassignLead && leadId) {
      try {
        const supabase = createServerClient()
        // Get user by phone number (if you have a users table with phone numbers)
        // For now, we'll just update the lead notes
        const { data: lead } = await supabase
          .from('leads')
          .select('notes')
          .eq('id', leadId)
          .single()

        if (lead) {
          const notes = lead.notes ? JSON.parse(lead.notes) : {}
          notes.smsSentTo = to
          notes.smsSentAt = new Date().toISOString()

          await supabase
            .from('leads')
            .update({ notes: JSON.stringify(notes) })
            .eq('id', leadId)
        }
      } catch (error) {
        console.error('Error updating lead notes:', error)
        // Don't fail the request if note update fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      message: 'SMS sent successfully' 
    })

  } catch (error: any) {
    console.error('SMS API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

