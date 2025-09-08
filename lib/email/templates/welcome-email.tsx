import { Link, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface WelcomeEmailProps {
  userName: string
  loginLink: string
  storeName?: string
  storeLogoUrl?: string
}

export const WelcomeEmail = ({
  userName,
  loginLink,
  storeName = "Your Store",
  storeLogoUrl = "https://via.placeholder.com/150x50",
}: WelcomeEmailProps) => {
  const previewText = `Welcome to ${storeName}!`

  return (
    <BaseTemplate
      previewText={previewText}
      heading={`Welcome to ${storeName}!`}
      storeName={storeName}
      storeLogoUrl={storeLogoUrl}
    >
      <Text style={paragraphStyle}>Hello {userName},</Text>

      <Text style={paragraphStyle}>
        Thank you for creating an account with {storeName}. We're excited to have you join our community!
      </Text>

      <Text style={paragraphStyle}>With your new account, you can:</Text>

      <ul style={listStyle}>
        <li style={listItemStyle}>Track your orders and view order history</li>
        <li style={listItemStyle}>Save your favorite products</li>
        <li style={listItemStyle}>Enjoy faster checkout with saved shipping and payment information</li>
        <li style={listItemStyle}>Receive exclusive offers and promotions</li>
      </ul>

      <Section style={ctaContainerStyle}>
        <Link href={loginLink} style={ctaButtonStyle}>
          Visit Your Account
        </Link>
      </Section>

      <Text style={paragraphStyle}>
        If you have any questions or need assistance, our customer support team is always ready to help.
      </Text>

      <Text style={paragraphStyle}>
        Happy shopping!
        <br />
        The {storeName} Team
      </Text>
    </BaseTemplate>
  )
}

const paragraphStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
  marginBottom: "24px",
}

const listStyle = {
  paddingLeft: "24px",
  margin: "0 0 24px",
}

const listItemStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
  marginBottom: "8px",
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
