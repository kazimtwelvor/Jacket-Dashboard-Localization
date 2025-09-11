import { Link, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface ShippingUpdateEmailProps {
  customerName: string
  orderNumber: string
  trackingNumber: string
  trackingUrl: string
  carrier: string
  // estimatedDelivery?: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  storeName?: string
  storeLogoUrl?: string
  storeUrl?: string
}

export const ShippingUpdateEmail = ({
  customerName,
  orderNumber,
  // trackingNumber,
  trackingUrl,
  carrier,
  // estimatedDelivery,
  shippingAddress,
  storeName = "Your Store",
  storeLogoUrl = "https://via.placeholder.com/150x50",
  storeUrl = "https://yourstore.com",
}: ShippingUpdateEmailProps) => {
  const previewText = `Your order #${orderNumber} has shipped!`

  return (
    <BaseTemplate
      previewText={previewText}
      heading="Your Order Has Shipped!"
      storeName={storeName}
      storeLogoUrl={storeLogoUrl}
    >
      <Text style={paragraphStyle}>Hello {customerName},</Text>

      <Text style={paragraphStyle}>
        Great news! Your order #{orderNumber} has been shipped and is on its way to you.
      </Text>

      <Section style={trackingContainerStyle}>
        <Text style={trackingTitleStyle}>Tracking Information</Text>
        <Text style={trackingInfoStyle}>
          <strong>Carrier:</strong> {carrier}
          <br />
          {/* <strong>Tracking Number:</strong> {trackingNumber} */}
          <br />
          {/* {estimatedDelivery && (
            <>
              <strong>Estimated Delivery:</strong> {estimatedDelivery}
              <br />
            </>
          )} */}
        </Text>

        <Section style={ctaContainerStyle}>
          <Link href={trackingUrl} style={ctaButtonStyle}>
            Track Your Package
          </Link>
        </Section>
      </Section>

      <Section style={sectionStyle}>
        <Text style={sectionTitleStyle}>Shipping Address</Text>
        <Text style={addressStyle}>
          {shippingAddress.line1}
          <br />
          {shippingAddress.line2 && (
            <>
              {shippingAddress.line2}
              <br />
            </>
          )}
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
          <br />
          {shippingAddress.country}
        </Text>
      </Section>

      <Section style={ctaContainerStyle}>
        <Link href={`${storeUrl}/orders/${orderNumber}`} style={secondaryButtonStyle}>
          View Order Details
        </Link>
      </Section>

      <Text style={noteStyle}>
        If you have any questions about your shipment, please contact our customer support team.
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

const trackingContainerStyle = {
  backgroundColor: "#f9f9f9",
  padding: "24px",
  borderRadius: "8px",
  marginBottom: "32px",
}

const trackingTitleStyle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#333333",
  marginBottom: "16px",
}

const trackingInfoStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
}

const sectionStyle = {
  marginBottom: "32px",
}

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#333333",
  marginBottom: "16px",
}

const addressStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
}

const ctaContainerStyle = {
  textAlign: "center" as const,
  margin: "24px 0",
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

const secondaryButtonStyle = {
  backgroundColor: "#ffffff",
  color: "#0070f3",
  padding: "11px 23px",
  borderRadius: "4px",
  border: "1px solid #0070f3",
  textDecoration: "none",
  fontWeight: "500" as const,
  fontSize: "16px",
  display: "inline-block",
}

const noteStyle = {
  fontSize: "14px",
  color: "#666666",
  textAlign: "center" as const,
}
