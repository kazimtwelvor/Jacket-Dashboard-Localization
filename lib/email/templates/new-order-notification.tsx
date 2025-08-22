import { Column, Img, Link, Row, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface NewOrderNotificationEmailProps {
  adminName: string
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  orderItems: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    line1: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  storeName: string
  storeLogoUrl?: string
  dashboardUrl: string
}

export const NewOrderNotificationEmail = ({
  adminName,
  orderNumber,
  orderDate,
  customerName,
  customerEmail,
  orderItems,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  paymentMethod,
  storeName,
  storeLogoUrl,
  dashboardUrl,
}: NewOrderNotificationEmailProps) => {
  const previewText = `New order #${orderNumber} received from ${customerName}`

  return (
    <BaseTemplate previewText={previewText} storeName={storeName} storeLogoUrl={storeLogoUrl}>
      <Section>
        <Text className="text-xl">Hello {adminName},</Text>

        <Text className="text-base">You have received a new order on your store.</Text>

        <Section className="bg-green-50 rounded-md p-4 my-4 border-l-4 border-green-500">
          <Text className="text-lg font-bold">Order #{orderNumber}</Text>
          <Text className="text-sm">Placed on {orderDate}</Text>
        </Section>

        <Text className="text-lg font-bold mt-4">Customer Information:</Text>
        <Text className="text-base">
          Name: {customerName}
          <br />
          Email: {customerEmail}
        </Text>

        <Text className="text-lg font-bold mt-4">Shipping Address:</Text>
        <Text className="text-base">
          {shippingAddress.line1}
          <br />
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
          <br />
          {shippingAddress.country}
        </Text>

        <Text className="text-lg font-bold mt-4">Payment Method:</Text>
        <Text className="text-base">{paymentMethod}</Text>

        <Text className="text-lg font-bold mt-4">Order Items:</Text>

        {orderItems.map((item) => (
          <Row key={item.id} className="border-b border-gray-200 py-2">
            <Column className="w-1/5">
              {item.imageUrl && (
                <Img src={item.imageUrl} width="80" height="80" alt={item.name} className="rounded-md" />
              )}
            </Column>
            <Column className="w-3/5">
              <Text className="text-base font-medium">{item.name}</Text>
              <Text className="text-sm text-gray-500">Qty: {item.quantity}</Text>
            </Column>
            <Column className="w-1/5 text-right">
              <Text className="text-base font-medium">${item.price.toFixed(2)}</Text>
            </Column>
          </Row>
        ))}

        <Section className="mt-4">
          <Row>
            <Column className="w-4/5 text-right">
              <Text className="text-base">Subtotal:</Text>
            </Column>
            <Column className="w-1/5 text-right">
              <Text className="text-base">${subtotal.toFixed(2)}</Text>
            </Column>
          </Row>
          <Row>
            <Column className="w-4/5 text-right">
              <Text className="text-base">Shipping:</Text>
            </Column>
            <Column className="w-1/5 text-right">
              <Text className="text-base">${shipping.toFixed(2)}</Text>
            </Column>
          </Row>
          <Row>
            <Column className="w-4/5 text-right">
              <Text className="text-base">Tax:</Text>
            </Column>
            <Column className="w-1/5 text-right">
              <Text className="text-base">${tax.toFixed(2)}</Text>
            </Column>
          </Row>
          <Row>
            <Column className="w-4/5 text-right">
              <Text className="text-lg font-bold">Total:</Text>
            </Column>
            <Column className="w-1/5 text-right">
              <Text className="text-lg font-bold">${total.toFixed(2)}</Text>
            </Column>
          </Row>
        </Section>

        <Section className="text-center mt-6">
          <Link
            href={`${dashboardUrl}/orders/${orderNumber}`}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md no-underline inline-block"
          >
            View Order Details
          </Link>
        </Section>
      </Section>
    </BaseTemplate>
  )
}

export default NewOrderNotificationEmail
