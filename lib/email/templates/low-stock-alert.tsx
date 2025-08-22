import { Column, Img, Link, Row, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface LowStockProduct {
  id: string
  name: string
  sku: string
  currentStock: number
  threshold: number
  imageUrl?: string
}

interface LowStockAlertEmailProps {
  adminName: string
  products: LowStockProduct[]
  storeName: string
  storeLogoUrl?: string
  dashboardUrl: string
}

export const LowStockAlertEmail = ({
  adminName,
  products,
  storeName,
  storeLogoUrl,
  dashboardUrl,
}: LowStockAlertEmailProps) => {
  const previewText = `Low stock alert for ${products.length} products in ${storeName}`

  return (
    <BaseTemplate previewText={previewText} storeName={storeName} storeLogoUrl={storeLogoUrl}>
      <Section>
        <Text className="text-xl">Hello {adminName},</Text>

        <Text className="text-base">
          This is an automated alert to inform you that the following products are running low on stock and may need to
          be replenished soon.
        </Text>

        <Section className="bg-amber-50 rounded-md p-4 my-4 border-l-4 border-amber-500">
          <Text className="text-lg font-bold">
            {products.length} {products.length === 1 ? "product" : "products"} below stock threshold
          </Text>
        </Section>

        {products.map((product) => (
          <Row key={product.id} className="border-b border-gray-200 py-4">
            <Column className="w-1/5">
              {product.imageUrl && (
                <Img src={product.imageUrl} width="80" height="80" alt={product.name} className="rounded-md" />
              )}
            </Column>
            <Column className="w-3/5">
              <Text className="text-base font-medium">{product.name}</Text>
              <Text className="text-sm text-gray-500">SKU: {product.sku}</Text>
              <Text className="text-sm text-gray-500">
                Current Stock: <span className="font-bold text-amber-600">{product.currentStock}</span> / Threshold:{" "}
                {product.threshold}
              </Text>
            </Column>
            <Column className="w-1/5 text-right">
              <Link href={`${dashboardUrl}/products/${product.id}`} className="text-blue-600 no-underline">
                View Product
              </Link>
            </Column>
          </Row>
        ))}

        <Section className="text-center mt-6">
          <Link
            href={`${dashboardUrl}/products`}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md no-underline inline-block"
          >
            Manage Inventory
          </Link>
        </Section>

        <Text className="text-sm text-gray-500 mt-6">
          This is an automated message from your inventory management system. You can adjust stock threshold levels in
          your store settings.
        </Text>
      </Section>
    </BaseTemplate>
  )
}

export default LowStockAlertEmail
