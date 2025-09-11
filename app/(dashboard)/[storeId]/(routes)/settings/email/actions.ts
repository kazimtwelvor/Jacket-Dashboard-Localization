"use server"

import { render } from "@react-email/render"
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation"
import { ShippingUpdateEmail } from "@/lib/email/templates/shipping-update"
import { WelcomeEmail } from "@/lib/email/templates/welcome-email"
import { PasswordResetEmail } from "@/lib/email/templates/password-reset"
import { AbandonedCartEmail } from "@/lib/email/templates/abandoned-cart"
import { ReviewRequestEmail } from "@/lib/email/templates/review-request"
import { AccountVerificationEmail } from "@/lib/email/templates/account-verification"
import { LowStockAlertEmail } from "@/lib/email/templates/low-stock-alert"
import { NewOrderNotificationEmail } from "@/lib/email/templates/new-order-notification"
import prismadb from "@/lib/prismadb"

export async function previewEmail(storeId: string, templateId: string) {
  try {
    const store = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return { success: false, error: "Store not found" }
    }

    let emailComponent
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"

    switch (templateId) {
      case "order-confirmation":
        emailComponent = OrderConfirmationEmail({
          customerName: "John Doe",
          customerEmail: "john.doe@example.com",
          orderNumber: "ORD-12345",
          orderDate: new Date().toLocaleDateString(),
          orderItems: [
            {
              id: "item1",
              name: "Premium T-Shirt",
              price: 29.99,
              quantity: 2,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
            {
              id: "item2",
              name: "Designer Jeans",
              price: 89.99,
              quantity: 1,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
          ],
          subtotal: 149.97,
          shipping: 9.99,
          // tax: 12.0,
          total: 171.96,
          shippingAddress: {
            line1: "123 Main St",
            city: "Anytown",
            state: "CA",
            postalCode: "12345",
            country: "USA",
          },
          paymentMethod: "Credit Card",
          // estimatedDelivery: "3-5 business days",
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          storeUrl: baseUrl,
        })
        break

      case "shipping-update":
        emailComponent = ShippingUpdateEmail({
          customerName: "John Doe",
          customerEmail: "john.doe@example.com",
          orderNumber: "ORD-12345",
          // trackingNumber: "TRK-9876543210",
          trackingUrl: "https://example.com/track",
          carrier: "FedEx",
          // estimatedDelivery: "Thursday, June 15, 2023",
          shippingAddress: {
            line1: "123 Main St",
            city: "Anytown",
            state: "CA",
            postalCode: "12345",
            country: "USA",
          },
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          storeUrl: baseUrl,
        })
        break

      case "welcome":
        emailComponent = WelcomeEmail({
          userName: "John Doe",
          email: "john.doe@example.com",
          loginLink: `${baseUrl}/sign-in?storeId=${storeId}`,
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
        })
        break

      case "password-reset":
        emailComponent = PasswordResetEmail({
          userName: "John Doe",
          email: "john.doe@example.com",
          resetLink: `${baseUrl}/reset-password?token=sample-token&email=john.doe@example.com&storeId=${storeId}`,
          expiryTime: "24 hours",
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
        })
        break

      case "abandoned-cart":
        emailComponent = AbandonedCartEmail({
          customerName: "John Doe",
          cartItems: [
            {
              id: "item1",
              name: "Premium T-Shirt",
              price: 29.99,
              quantity: 2,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
            {
              id: "item2",
              name: "Designer Jeans",
              price: 89.99,
              quantity: 1,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
          ],
          cartTotal: 149.97,
          cartUrl: `${baseUrl}/cart?recover=sample-cart-id`,
          discountCode: "COMEBACK15",
          discountAmount: "15%",
          expiryTime: "24 hours",
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          storeUrl: baseUrl,
        })
        break

      case "review-request":
        emailComponent = ReviewRequestEmail({
          customerName: "John Doe",
          orderNumber: "ORD-12345",
          products: [
            {
              id: "prod1",
              name: "Premium T-Shirt",
              imageUrl: "/placeholder.svg?height=100&width=100",
              reviewUrl: `${baseUrl}/products/prod1?review=true`,
            },
            {
              id: "prod2",
              name: "Designer Jeans",
              imageUrl: "/placeholder.svg?height=100&width=100",
              reviewUrl: `${baseUrl}/products/prod2?review=true`,
            },
          ],
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          storeUrl: baseUrl,
        })
        break

      case "account-verification":
        emailComponent = AccountVerificationEmail({
          userName: "John Doe",
          email: "john.doe@example.com",
          verificationLink: `${baseUrl}/verify-account?token=sample-token&email=john.doe@example.com&storeId=${storeId}`,
          expiryTime: "24 hours",
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
        })
        break

      case "low-stock-alert":
        emailComponent = LowStockAlertEmail({
          adminName: "Admin User",
          products: [
            {
              id: "prod1",
              name: "Premium T-Shirt",
              sku: "TS-001",
              currentStock: 3,
              threshold: 5,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
            {
              id: "prod2",
              name: "Designer Jeans",
              sku: "DJ-002",
              currentStock: 2,
              threshold: 10,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
          ],
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          dashboardUrl: `${baseUrl}/${storeId}`,
        })
        break

      case "new-order-notification":
        emailComponent = NewOrderNotificationEmail({
          adminName: "Admin User",
          orderNumber: "ORD-12345",
          orderDate: new Date().toLocaleDateString(),
          customerName: "John Doe",
          customerEmail: "john.doe@example.com",
          orderItems: [
            {
              id: "item1",
              name: "Premium T-Shirt",
              price: 29.99,
              quantity: 2,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
            {
              id: "item2",
              name: "Designer Jeans",
              price: 89.99,
              quantity: 1,
              imageUrl: "/placeholder.svg?height=80&width=80",
            },
          ],
          subtotal: 149.97,
          shipping: 9.99,
          // tax: 12.0,
          total: 171.96,
          shippingAddress: {
            line1: "123 Main St",
            city: "Anytown",
            state: "CA",
            postalCode: "12345",
            country: "USA",
          },
          paymentMethod: "Credit Card",
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          dashboardUrl: `${baseUrl}/${storeId}`,
        })
        break

      default:
        return { success: false, error: "Invalid template ID" }
    }

    // Render the email to HTML
    const html = render(emailComponent, {
      pretty: true,
    })

    return { success: true, html }
  } catch (error) {
    return { success: false, error: "Failed to generate email preview" }
  }
}
