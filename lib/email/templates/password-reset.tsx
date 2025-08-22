import { Hr, Link, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface PasswordResetEmailProps {
  userName: string
  resetLink: string
  expiryTime?: string
  storeName?: string
  storeLogoUrl?: string
}

export const PasswordResetEmail = ({
  userName,
  resetLink,
  expiryTime = "1 hour",
  storeName = "Your Store",
  storeLogoUrl = "https://via.placeholder.com/150x50",
}: PasswordResetEmailProps) => {
  const previewText = "Reset your password"

  return (
    <BaseTemplate
      previewText={previewText}
      heading="Reset Your Password"
      storeName={storeName}
      storeLogoUrl={storeLogoUrl}
    >
      <Text style={paragraphStyle}>Hello {userName},</Text>

      <Text style={paragraphStyle}>
        We received a request to reset your password for your {storeName} account. If you didn't make this request, you
        can safely ignore this email.
      </Text>

      <Text style={paragraphStyle}>
        To reset your password, click the button below. This link will expire in {expiryTime}.
      </Text>

      <Section style={ctaContainerStyle}>
        <Link href={resetLink} style={ctaButtonStyle}>
          Reset Password
        </Link>
      </Section>

      <Text style={paragraphStyle}>If the button above doesn't work, copy and paste this URL into your browser:</Text>

      <Text style={linkTextStyle}>{resetLink}</Text>

      <Text style={securityNoteStyle}>
        For security reasons, this password reset link will expire in {expiryTime}. If you need to reset your password
        after that time, please request a new reset link.
      </Text>

      <Hr style={dividerStyle} />

      <Text style={footerNoteStyle}>
        If you didn't request a password reset, please contact our support team immediately at{" "}
        <Link href="mailto:support@yourstore.com" style={linkStyle}>
          support@yourstore.com
        </Link>
      </Text>
    </BaseTemplate>
  )
}

// Styles
const paragraphStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
  marginBottom: "24px",
}

const ctaContainerStyle = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const ctaButtonStyle = {
  backgroundColor: "#0070f3",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "500" as const,
  fontSize: "16px",
  display: "inline-block",
}

const linkTextStyle = {
  fontSize: "14px",
  color: "#0070f3",
  marginBottom: "24px",
  wordBreak: "break-all" as const,
}

const securityNoteStyle = {
  fontSize: "14px",
  color: "#666666",
  marginBottom: "24px",
  padding: "12px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
}

const dividerStyle = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
}

const footerNoteStyle = {
  fontSize: "14px",
  color: "#666666",
}

const linkStyle = {
  color: "#0070f3",
  textDecoration: "underline",
}
