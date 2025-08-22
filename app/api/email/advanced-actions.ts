"use server"

import { queueEmail } from "@/lib/email/queue/producer"
import prismadb from "@/lib/prismadb"
import { emailLogger } from "@/lib/email/logger"

/**
 * Send abandoned cart reminder email
 */
export async function sendAbandonedCartEmail(
  cartId: string,
  options?: {
    includeDiscount?: boolean
    discountAmount?: string
    discountCode?: string
    expiryHours?: number
  },
) {
  try {
    // Get cart details from database
    const cart = await prismadb.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        user: true,
      },
    })

    if (!cart || !cart.items.length) {
      throw new Error(`Cart not found or empty: ${cartId}`)
    }

    // Get store details
    const store = await prismadb.store.findUnique({
      where: { id: cart.storeId },
    })

    if (!store) {
      throw new Error(`Store not found for cart: ${cartId}`)
    }

    // Format cart items for email template
    const cartItems = cart.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      price: Number.parseFloat(item.product.price.toString()),
      quantity: item.quantity,
      imageUrl: item.product.images[0]?.url,
    }))

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Build cart URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const cartUrl = `${baseUrl}/cart?recover=${cartId}`

    // Queue the email
    const result = await queueEmail({
      type: "abandoned-cart",
      payload: {
        customerName: cart.user?.name || "Valued Customer",
        customerEmail: cart.user?.email,
        cartItems,
        cartTotal,
        cartUrl,
        discountCode: options?.includeDiscount ? options.discountCode : undefined,
        discountAmount: options?.includeDiscount ? options.discountAmount : undefined,
        expiryTime: options?.expiryHours ? `${options.expiryHours} hours` : "24 hours",
        storeName: store.name,
        storeLogoUrl: store.logoUrl || undefined,
        storeUrl: baseUrl,
      },
      metadata: {
        cartId,
        userId: cart.userId,
        storeId: cart.storeId,
      },
    })

    return result
  } catch (error) {
    emailLogger.error({
      event: "send_abandoned_cart_email_error",
      error,
      metadata: { cartId },
    })

    throw error
  }
}

/**
 * Send low stock alert email to store administrators
 */
export async function sendLowStockAlertEmail(storeId: string, productIds: string[]) {
  try {
    // Get store details
    const store = await prismadb.store.findUnique({
      where: { id: storeId },
      include: {
        users: {
          where: {
            role: {
              in: ["ADMIN", "OWNER"],
            },
          },
        },
      },
    })

    if (!store) {
      throw new Error(`Store not found: ${storeId}`)
    }

    // Get products with low stock
    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        storeId,
      },
      include: {
        images: {
          take: 1,
        },
      },
    })

    if (!products.length) {
      throw new Error(`No products found for the provided IDs`)
    }

    // Format products for email template
    const lowStockProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku || product.id,
      currentStock: product.quantity,
      threshold: product.lowStockThreshold || 5,
      imageUrl: product.images[0]?.url,
    }))

    // Build dashboard URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const dashboardUrl = `${baseUrl}/${storeId}`

    // Send email to each admin
    const emailPromises = store.users.map(async (admin) => {
      return queueEmail({
        type: "low-stock-alert",
        payload: {
          adminName: admin.name || "Administrator",
          adminEmail: admin.email,
          products: lowStockProducts,
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          dashboardUrl,
        },
        metadata: {
          storeId,
          productIds,
        },
      })
    })

    const results = await Promise.all(emailPromises)
    return { success: true, results }
  } catch (error) {
    emailLogger.error({
      event: "send_low_stock_alert_error",
      error,
      metadata: { storeId, productIds },
    })

    throw error
  }
}

/**
 * Send new order notification email to store administrators
 */
export async function sendNewOrderNotificationEmail(orderId: string) {
  try {
    // Get order details from database
    const order = await prismadb.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    // Get store details with admin users
    const store = await prismadb.store.findUnique({
      where: { id: order.storeId },
      include: {
        users: {
          where: {
            role: {
              in: ["ADMIN", "OWNER"],
            },
          },
        },
      },
    })

    if (!store) {
      throw new Error(`Store not found for order: ${orderId}`)
    }

    // Format order data for email template
    const orderItems = order.orderItems.map((item) => ({
      id: item.id,
      name: item.product.name,
      price: Number.parseFloat(item.product.price.toString()),
      quantity: item.quantity,
      imageUrl: item.product.images[0]?.url,
    }))

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = Number.parseFloat(order.shippingFee?.toString() || "0")
    const tax = Number.parseFloat(order.taxAmount?.toString() || "0")
    const total = Number.parseFloat(order.totalPrice.toString())

    // Build dashboard URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const dashboardUrl = `${baseUrl}/${order.storeId}`

    // Send email to each admin
    const emailPromises = store.users.map(async (admin) => {
      return queueEmail({
        type: "new-order-notification",
        payload: {
          adminName: admin.name || "Administrator",
          adminEmail: admin.email,
          orderNumber: order.orderNumber || order.id,
          orderDate: order.createdAt.toLocaleDateString(),
          customerName: order.name,
          customerEmail: order.email,
          orderItems,
          subtotal,
          shipping,
          tax,
          total,
          shippingAddress: {
            line1: order.address || "",
            city: order.city || "",
            state: order.state || "",
            postalCode: order.zipCode || "",
            country: order.country || "",
          },
          paymentMethod: order.paymentMethod || "Credit Card",
          storeName: store.name,
          storeLogoUrl: store.logoUrl || undefined,
          dashboardUrl,
        },
        metadata: {
          orderId,
          storeId: order.storeId,
        },
      })
    })

    const results = await Promise.all(emailPromises)
    return { success: true, results }
  } catch (error) {
    emailLogger.error({
      event: "send_new_order_notification_error",
      error,
      metadata: { orderId },
    })

    throw error
  }
}

/**
 * Send review request email to customer after purchase
 */
export async function sendReviewRequestEmail(orderId: string) {
  try {
    // Get order details from database
    const order = await prismadb.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    // Get store details
    const store = await prismadb.store.findUnique({
      where: { id: order.storeId },
    })

    if (!store) {
      throw new Error(`Store not found for order: ${orderId}`)
    }

    // Build store URL
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_STORE_URL || "https://yourstore.com"

    // Format products for review
    const productsToReview = order.orderItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      imageUrl: item.product.images[0]?.url,
      reviewUrl: `${baseUrl}/products/${item.product.id}?review=true`,
    }))

    // Queue the email
    const result = await queueEmail({
      type: "review-request",
      payload: {
        customerName: order.name,
        customerEmail: order.email,
        orderNumber: order.orderNumber || order.id,
        products: productsToReview,
        storeName: store.name,
        storeLogoUrl: store.logoUrl || undefined,
        storeUrl: baseUrl,
      },
      metadata: {
        orderId,
        storeId: order.storeId,
      },
      // Delay review request by 7 days
      options: {
        delay: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      },
    })

    return result
  } catch (error) {
    emailLogger.error({
      event: "send_review_request_error",
      error,
      metadata: { orderId },
    })

    throw error
  }
}

/**
 * Send account verification email
 */
export async function sendAccountVerificationEmail(userId: string, storeId: string) {
  try {
    // Find user
    const user = await prismadb.storeUser.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    // Get store details
    const store = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new Error(`Store not found: ${storeId}`)
    }

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Calculate expiry (24 hours from now)
    const verificationTokenExp = new Date()
    verificationTokenExp.setHours(verificationTokenExp.getHours() + 24)

    // Save verification token
    await prismadb.storeUser.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExp,
      },
    })

    // Build verification link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const verificationLink = `${baseUrl}/verify-account?token=${verificationToken}&email=${encodeURIComponent(user.email)}&storeId=${storeId}`

    // Queue the email
    const result = await queueEmail({
      type: "account-verification",
      payload: {
        userName: user.name,
        email: user.email,
        verificationLink,
        expiryTime: "24 hours",
        storeName: store.name,
        storeLogoUrl: store.logoUrl || undefined,
      },
      metadata: {
        userId,
        storeId,
      },
    })

    return result
  } catch (error) {
    emailLogger.error({
      event: "send_account_verification_error",
      error,
      metadata: { userId, storeId },
    })

    throw error
  }
}
