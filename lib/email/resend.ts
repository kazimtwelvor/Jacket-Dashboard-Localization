import { Resend } from "resend"
import type { JSX } from "react"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email sender configuration
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || "noreply@yourdomain.com"
const DEFAULT_REPLY_TO = process.env.DEFAULT_REPLY_TO || "support@yourdomain.com"

// Types for email sending
export interface EmailPayload {
  to: string | string[]
  subject: string
  react: JSX.Element
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  attachments?: {
    filename: string
    content: Buffer
    contentType?: string
  }[]
}

// Function to send email using Resend
export async function sendEmail({
  to,
  subject,
  react,
  from = DEFAULT_FROM_EMAIL,
  cc,
  bcc,
  replyTo = DEFAULT_REPLY_TO,
  attachments,
}: EmailPayload) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      cc,
      bcc,
      reply_to: replyTo,
      attachments,
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

// Function to validate email address format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Export the Resend instance for direct access if needed
export { resend }
