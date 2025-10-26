import nodemailer from 'nodemailer'

// Google Workspace SMTP configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_EMAIL, // Your Google Workspace email
    pass: process.env.GOOGLE_APP_PASSWORD, // App-specific password
  },
})

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
  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
