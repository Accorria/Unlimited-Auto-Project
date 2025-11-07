// SMS notification system using Twilio
import twilio from 'twilio'

// Initialize Twilio client only if credentials are available
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+13137664475'

export interface SMSNotification {
  to: string
  message: string
  leadType?: 'incomplete' | 'phone_click' | 'email_click' | 'form_submit' | 'appointment' | 'lead'
  leadData?: any
}

export interface Lead {
  id?: string
  name?: string
  phone?: string
  email?: string
  vehicle_id?: string
  source?: string
  message?: string
  [key: string]: any
}

/**
 * Send a single SMS message via Twilio
 */
export async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!twilioClient) {
    console.error('Twilio not configured - missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN')
    return { success: false, error: 'SMS not configured' }
  }

  // Validate phone number format (E.164)
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  if (!phoneRegex.test(to)) {
    console.error('Invalid phone number format:', to)
    return { success: false, error: 'Invalid phone number format. Must be in E.164 format (e.g., +13137664475)' }
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    })

    console.log('📱 SMS sent successfully:', result.sid)
    return { success: true, messageId: result.sid }
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    return { success: false, error: error.message || 'Failed to send SMS' }
  }
}

/**
 * Send SMS notification for a lead
 */
export async function sendSMSNotification(notification: SMSNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = formatSMSMessage(notification)
  return sendSMS(notification.to, message)
}

/**
 * Format SMS message based on lead type
 */
function formatSMSMessage(notification: SMSNotification): string {
  const { leadType, leadData } = notification
  
  if (leadType === 'lead' && leadData) {
    const lead = leadData as Lead
    const vehicleInfo = lead.vehicle_id ? `\n🚗 Vehicle ID: ${lead.vehicle_id}` : ''
    const adminUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads${lead.id ? `?lead=${lead.id}` : ''}`
      : 'Check admin dashboard'
    
    return `🚗 New Lead: ${lead.name || 'Unknown'}
📞 Phone: ${lead.phone || 'Not provided'}
📧 Email: ${lead.email || 'Not provided'}${vehicleInfo}
🔗 View: ${adminUrl}`
  }
  
  switch (leadType) {
    case 'incomplete':
      return `🚗 NEW INCOMPLETE LEAD: ${leadData.name || 'Unknown'} - ${leadData.phone || 'No phone'} - ${leadData.email || 'No email'} - Started ${leadData.formType} but didn't finish. Call them back ASAP!`
    
    case 'phone_click':
      return `📞 PHONE CLICK: Someone clicked your number from ${leadData.source}. Check your missed calls!`
    
    case 'email_click':
      return `📧 EMAIL CLICK: Someone clicked your email from ${leadData.source}. Check your inbox!`
    
    case 'form_submit':
      return `📝 NEW LEAD: ${leadData.name} - ${leadData.phone} - ${leadData.email} - ${leadData.formType} form completed. Call them now!`
    
    case 'appointment':
      return `📅 NEW APPOINTMENT: ${leadData.name || 'Unknown'} - ${leadData.phone || 'No phone'} - ${leadData.appointmentDate || 'Date TBD'} at ${leadData.appointmentTime || 'Time TBD'}`
    
    default:
      return notification.message || `🚗 NEW ACTIVITY: ${leadData?.name || 'Unknown'} - Check your admin dashboard for details.`
  }
}

/**
 * Send SMS notification for a lead to configured phone numbers
 */
export async function sendSMSNotificationForLead(lead: Lead, phoneNumbers: string[]): Promise<Array<{ number: string; result: { success: boolean; messageId?: string; error?: string } }>> {
  const results = []
  
  for (const number of phoneNumbers) {
    const result = await sendSMSNotification({
      to: number,
      message: '', // Will be formatted by formatSMSMessage
      leadType: 'lead',
      leadData: lead
    })
    results.push({ number, result })
  }
  
  return results
}

/**
 * Send SMS to multiple numbers (for your team)
 */
export async function sendSMSToTeam(notification: Omit<SMSNotification, 'to'>, phoneNumbers: string[]): Promise<Array<{ number: string; result: { success: boolean; messageId?: string; error?: string } }>> {
  const results = []
  
  for (const number of phoneNumbers) {
    const result = await sendSMSNotification({
      ...notification,
      to: number
    })
    results.push({ number, result })
  }
  
  return results
}

