import { Column, Img, Link, Row, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface AbandonedCartEmailProps {
  customerName: string
  cartItems: CartItem[]
  cartTotal: number
  cartUrl: string
  discountCode?: string
  discountAmount?: string
  expiryTime?: string
  storeName: string
  storeLogoUrl?: string
  storeUrl: string
}

export const AbandonedCartEmail = ({
  customerName,
  cartItems,
  cartTotal,
  cartUrl,
  discountCode,
  discountAmount,
  expiryTime = "24 hours",
  storeName,
  storeLogoUrl,
  storeUrl,
}: AbandonedCartEmailProps) => {
  const previewText = `Complete your purchase at ${storeName}${discountCode ? ` and save ${discountAmount}` : ""}`

  return (
    <BaseTemplate previewText={previewText} storeName={storeName} storeLogoUrl={storeLogoUrl}>
      <Section>
        <Text className="text-xl">Hello {customerName},</Text>

        <Text className="text-base">
          We noticed you left some items in your shopping cart. Would you like to complete your purchase?
        </Text>

        {discountCode && (
          <Section className="bg-gray-50 rounded-md p-4 my-4">
            <Text className="text-lg font-bold text-center">Special Offer Just For You!</Text>
            <Text className="text-base text-center">
              Use code <span className="font-bold">{discountCode}</span> at checkout to save {discountAmount}
            </Text>
            <Text className="text-sm text-center text-gray-500">Offer expires in {expiryTime}</Text>
          </Section>
        )}

        <Text className="text-lg font-bold mt-4">Your Cart Items:</Text>

        {cartItems.map((item) => (
          <Row key={item.id} className="border-b border-gray-200 py-2">
            <Column className="w-1/4">
              {item.imageUrl && (
                <Img src={item.imageUrl} width="80" height="80" alt={item.name} className="rounded-md" />
              )}
            </Column>
            <Column className="w-2/4">
              <Text className="text-base font-medium">{item.name}</Text>
              <Text className="text-sm text-gray-500">Qty: {item.quantity}</Text>
            </Column>
            <Column className="w-1/4 text-right">
              <Text className="text-base font-medium">${item.price.toFixed(2)}</Text>
            </Column>
          </Row>
        ))}

        <Section className="mt-4 text-right">
          <Text className="text-lg font-bold">Total: ${cartTotal.toFixed(2)}</Text>
        </Section>

        <Section className="text-center mt-6">
          <Link
            href={cartUrl}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md no-underline inline-block"
          >
            Complete Your Purchase
          </Link>
        </Section>

        <Text className="text-sm text-gray-500 mt-6">
          If you have any questions or need assistance, please don't hesitate to contact our customer support team.
        </Text>
      </Section>
    </BaseTemplate>
  )
}

export default AbandonedCartEmail
