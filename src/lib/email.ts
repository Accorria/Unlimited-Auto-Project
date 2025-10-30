import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
  from = 'noreply@unlimitedautorepaircollision.com'
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
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
    console.log('Email sent successfully:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
