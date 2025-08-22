import { Column, Hr, Img, Link, Row, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface OrderConfirmationProps {
  customerName: string
  orderNumber: string
  orderDate: string
  orderItems: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  estimatedDelivery?: string
  storeName?: string
  storeLogoUrl?: string
  storeUrl?: string
}

export const OrderConfirmationEmail = ({
  customerName,
  orderNumber,
  orderDate,
  orderItems,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  paymentMethod,
  estimatedDelivery,
  storeName = "Your Store",
  storeLogoUrl = "https://via.placeholder.com/150x50",
  storeUrl = "https://yourstore.com",
}: OrderConfirmationProps) => {
  const previewText = `Order Confirmation #${orderNumber}`

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <BaseTemplate
      previewText={previewText}
      heading={`Thank you for your order, ${customerName}!`}
      storeName={storeName}
      storeLogoUrl={storeLogoUrl}
    >
      <Text style={paragraphStyle}>
        Your order has been confirmed and is now being processed. We'll send you another email when your order ships.
      </Text>

      <Section style={sectionStyle}>
        <Text style={sectionTitleStyle}>Order Summary</Text>
        <Text style={orderInfoStyle}>
          <strong>Order Number:</strong> {orderNumber}
          <br />
          <strong>Order Date:</strong> {orderDate}
          <br />
          {estimatedDelivery && (
            <>
              <strong>Estimated Delivery:</strong> {estimatedDelivery}
              <br />
            </>
          )}
        </Text>
      </Section>

      <Section style={sectionStyle}>
        <Text style={sectionTitleStyle}>Order Items</Text>

        {orderItems.map((item) => (
          <Row key={item.id} style={itemRowStyle}>
            <Column style={{ width: "80px" }}>
              {item.imageUrl ? (
                <Img src={item.imageUrl} width="70" height="70" alt={item.name} style={itemImageStyle} />
              ) : (
                <div style={placeholderImageStyle}></div>
              )}
            </Column>
            <Column>
              <Text style={itemNameStyle}>{item.name}</Text>
              <Text style={itemMetaStyle}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={{ width: "100px", textAlign: "right" as const }}>
              <Text style={itemPriceStyle}>{formatCurrency(item.price * item.quantity)}</Text>
            </Column>
          </Row>
        ))}

        <Hr style={dividerStyle} />

        <Row style={summaryRowStyle}>
          <Column>
            <Text style={summaryLabelStyle}>Subtotal</Text>
          </Column>
          <Column style={{ width: "100px", textAlign: "right" as const }}>
            <Text style={summaryValueStyle}>{formatCurrency(subtotal)}</Text>
          </Column>
        </Row>

        <Row style={summaryRowStyle}>
          <Column>
            <Text style={summaryLabelStyle}>Shipping</Text>
          </Column>
          <Column style={{ width: "100px", textAlign: "right" as const }}>
            <Text style={summaryValueStyle}>{formatCurrency(shipping)}</Text>
          </Column>
        </Row>

        <Row style={summaryRowStyle}>
          <Column>
            <Text style={summaryLabelStyle}>Tax</Text>
          </Column>
          <Column style={{ width: "100px", textAlign: "right" as const }}>
            <Text style={summaryValueStyle}>{formatCurrency(tax)}</Text>
          </Column>
        </Row>

        <Row style={totalRowStyle}>
          <Column>
            <Text style={totalLabelStyle}>Total</Text>
          </Column>
          <Column style={{ width: "100px", textAlign: "right" as const }}>
            <Text style={totalValueStyle}>{formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={sectionStyle}>
        <Row>
          <Column>
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
          </Column>
          <Column>
            <Text style={sectionTitleStyle}>Payment Method</Text>
            <Text style={addressStyle}>{paymentMethod}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={ctaContainerStyle}>
        <Link href={`${storeUrl}/orders/${orderNumber}`} style={ctaButtonStyle}>
          View Order Status
        </Link>
      </Section>

      <Text style={supportTextStyle}>
        If you have any questions or concerns, please contact our customer support at{" "}
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

const sectionStyle = {
  marginBottom: "32px",
}

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#333333",
  marginBottom: "16px",
}

const orderInfoStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
}

const itemRowStyle = {
  marginBottom: "16px",
}

const itemImageStyle = {
  borderRadius: "4px",
  border: "1px solid #e6e6e6",
}

const placeholderImageStyle = {
  width: "70px",
  height: "70px",
  backgroundColor: "#f0f0f0",
  borderRadius: "4px",
}

const itemNameStyle = {
  fontSize: "16px",
  fontWeight: "500" as const,
  color: "#333333",
  margin: "0 0 4px",
}

const itemMetaStyle = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
}

const itemPriceStyle = {
  fontSize: "16px",
  fontWeight: "500" as const,
  color: "#333333",
}

const dividerStyle = {
  borderColor: "#e6e6e6",
  margin: "16px 0",
}

const summaryRowStyle = {
  margin: "8px 0",
}

const summaryLabelStyle = {
  fontSize: "14px",
  color: "#666666",
}

const summaryValueStyle = {
  fontSize: "14px",
  color: "#333333",
}

const totalRowStyle = {
  margin: "16px 0 0",
}

const totalLabelStyle = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#333333",
}

const totalValueStyle = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#333333",
}

const addressStyle = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#333333",
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

const supportTextStyle = {
  fontSize: "14px",
  color: "#666666",
  margin: "24px 0 0",
  textAlign: "center" as const,
}

const linkStyle = {
  color: "#0070f3",
  textDecoration: "underline",
}
