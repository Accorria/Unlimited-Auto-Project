import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
  from = 'onboarding@resend.dev'
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  if (!resend) {
    console.log('📧 Email notification skipped - Resend API key not configured')
    return { success: true, messageId: 'skipped-no-api-key' }
  }

  try {
    console.log('📧 Attempting to send email via Resend to:', to)
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
    console.log('✅ Email sent successfully! Full result:', JSON.stringify(result, null, 2))
    console.log('📧 Email ID:', result.data?.id || 'No ID returned')
    return { success: true, messageId: result.data?.id || result.id }
  } catch (error: any) {
    console.error('❌ Error sending email:', error)
    console.error('Error details:', error.message, error.stack)
    return { success: false, error: error.message }
  }
}
