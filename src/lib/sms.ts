// SMS notification system using Resend
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface SMSNotification {
  to: string
  message: string
  leadType: 'incomplete' | 'phone_click' | 'email_click' | 'form_submit'
  leadData?: any
}

export async function sendSMSNotification(notification: SMSNotification) {
  if (!resend) {
    console.error('Resend API key not configured')
    return { success: false, error: 'SMS not configured' }
  }

  try {
    // Format the SMS message
    const smsMessage = formatSMSMessage(notification)
    
    // Send SMS using Resend
    const result = await resend.sms.send({
      from: '+13137732380', // Your business phone number
      to: notification.to,
      message: smsMessage
    })

    console.log('📱 SMS sent successfully:', result)
    return { success: true, messageId: result.id }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return { success: false, error: error.message }
  }
}

function formatSMSMessage(notification: SMSNotification): string {
  const { leadType, leadData } = notification
  
  switch (leadType) {
    case 'incomplete':
      return `🚗 NEW INCOMPLETE LEAD: ${leadData.name || 'Unknown'} - ${leadData.phone || 'No phone'} - ${leadData.email || 'No email'} - Started ${leadData.formType} but didn't finish. Call them back ASAP!`
    
    case 'phone_click':
      return `📞 PHONE CLICK: Someone clicked your number from ${leadData.source}. Check your missed calls!`
    
    case 'email_click':
      return `📧 EMAIL CLICK: Someone clicked your email from ${leadData.source}. Check your inbox!`
    
    case 'form_submit':
      return `📝 NEW LEAD: ${leadData.name} - ${leadData.phone} - ${leadData.email} - ${leadData.formType} form completed. Call them now!`
    
    default:
      return `🚗 NEW ACTIVITY: ${leadData.name || 'Unknown'} - Check your admin dashboard for details.`
  }
}

// Send SMS to multiple numbers (for your team)
export async function sendSMSToTeam(notification: Omit<SMSNotification, 'to'>) {
  const teamNumbers = [
    '+13137732380', // Your main number
    // Add other team member numbers here
  ]

  const results = []
  for (const number of teamNumbers) {
    const result = await sendSMSNotification({
      ...notification,
      to: number
    })
    results.push({ number, result })
  }

  return results
}
