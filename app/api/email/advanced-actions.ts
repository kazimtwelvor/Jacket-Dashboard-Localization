"use server"

import { queueEmail } from "@/lib/email/queue/producer"
import prismadb from "@/lib/prismadb"
import { emailLogger } from "@/lib/email/logger"


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

    const store = await prismadb.store.findUnique({
      where: { id: cart.storeId },
    })

    if (!store) {
      throw new Error(`Store not found for cart: ${cartId}`)
    }

    const cartItems = cart.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      price: Number.parseFloat(item.product.price.toString()),
      quantity: item.quantity,
      imageUrl: item.product.images[0]?.url,
    }))

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const cartUrl = `${baseUrl}/cart?recover=${cartId}`
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


export async function sendLowStockAlertEmail(storeId: string, productIds: string[]) {
  try {
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

    const lowStockProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku || product.id,
      currentStock: product.quantity,
      threshold: product.lowStockThreshold || 5,
      imageUrl: product.images[0]?.url,
    }))

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const dashboardUrl = `${baseUrl}/${storeId}`
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


export async function sendNewOrderNotificationEmail(orderId: string) {
  try {
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

    const orderItems = order.orderItems.map((item) => ({
      id: item.id,
      name: item.product.name,
      price: Number.parseFloat(item.product.price.toString()),
      quantity: item.quantity,
      imageUrl: item.product.images[0]?.url,
    }))

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = Number.parseFloat(order.shippingFee?.toString() || "0")
    // const tax = Number.parseFloat(order.taxAmount?.toString() || "0")
    const total = Number.parseFloat(order.totalPrice.toString())
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const dashboardUrl = `${baseUrl}/${order.storeId}`
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
          // tax,
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


export async function sendReviewRequestEmail(orderId: string) {
  try {
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

    const store = await prismadb.store.findUnique({
      where: { id: order.storeId },
    })

    if (!store) {
      throw new Error(`Store not found for order: ${orderId}`)
    }

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_STORE_URL || "https://yourstore.com"

    const productsToReview = order.orderItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      imageUrl: item.product.images[0]?.url,
      reviewUrl: `${baseUrl}/products/${item.product.id}?review=true`,
    }))

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


export async function sendAccountVerificationEmail(userId: string, storeId: string) {
  try {
    const user = await prismadb.storeUser.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    const store = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new Error(`Store not found: ${storeId}`)
    }
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const verificationTokenExp = new Date()
    verificationTokenExp.setHours(verificationTokenExp.getHours() + 24)
    await prismadb.storeUser.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExp,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const verificationLink = `${baseUrl}/verify-account?token=${verificationToken}&email=${encodeURIComponent(user.email)}&storeId=${storeId}`

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
