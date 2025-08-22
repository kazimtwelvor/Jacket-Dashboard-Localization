import { Column, Img, Link, Row, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface ProductToReview {
  id: string
  name: string
  imageUrl?: string
  reviewUrl: string
}

interface ReviewRequestEmailProps {
  customerName: string
  orderNumber: string
  products: ProductToReview[]
  storeName: string
  storeLogoUrl?: string
  storeUrl: string
}

export const ReviewRequestEmail = ({
  customerName,
  orderNumber,
  products,
  storeName,
  storeLogoUrl,
  storeUrl,
}: ReviewRequestEmailProps) => {
  const previewText = `How was your experience with ${storeName}? Share your feedback!`

  return (
    <BaseTemplate previewText={previewText} storeName={storeName} storeLogoUrl={storeLogoUrl}>
      <Section>
        <Text className="text-xl">Hello {customerName},</Text>

        <Text className="text-base">
          Thank you for your recent purchase from {storeName}. We hope you're enjoying your new items!
        </Text>

        <Text className="text-base mt-4">
          We'd love to hear your thoughts on the products you ordered. Your feedback helps us improve and assists other
          customers in making informed decisions.
        </Text>

        <Text className="text-lg font-bold mt-4">Your Recent Purchase (Order #{orderNumber}):</Text>

        {products.map((product) => (
          <Row key={product.id} className="border border-gray-200 rounded-md my-4 overflow-hidden">
            <Column className="w-1/4 p-4">
              {product.imageUrl && (
                <Img src={product.imageUrl} width="100" height="100" alt={product.name} className="rounded-md" />
              )}
            </Column>
            <Column className="w-3/4 p-4">
              <Text className="text-base font-medium">{product.name}</Text>

              <Section className="mt-4">
                <Link
                  href={product.reviewUrl}
                  className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-md no-underline inline-block"
                >
                  Write a Review
                </Link>
              </Section>
            </Column>
          </Row>
        ))}

        <Section className="text-center mt-6">
          <Link
            href={`${storeUrl}/my-orders/${orderNumber}`}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md no-underline inline-block"
          >
            View Your Order
          </Link>
        </Section>

        <Text className="text-sm text-gray-500 mt-6">
          Thank you for shopping with {storeName}. We value your feedback and appreciate your support!
        </Text>
      </Section>
    </BaseTemplate>
  )
}

export default ReviewRequestEmail
