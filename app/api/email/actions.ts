"use server"

import { queueEmail } from "@/lib/email/queue/producer"
import prismadb from "@/lib/prismadb"
import { emailLogger } from "@/lib/email/logger"

export async function sendOrderConfirmationEmail(orderId: string) {
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

    const result = await queueEmail({
      type: "order-confirmation",
      payload: {
        customerName: order.name,
        customerEmail: order.email,
        orderNumber: order.orderNumber || order.id,
        orderDate: order.createdAt.toLocaleDateString(),
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
        estimatedDelivery: "3-5 business days",
        storeName: store.name,
        storeLogoUrl: store.logoUrl || undefined,
        storeUrl: process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com",
      },
      metadata: {
        orderId,
        storeId: order.storeId,
      },
    })

    return result
  } catch (error) {
    emailLogger.error({
      event: "send_order_confirmation_error",
      error,
      metadata: { orderId },
    })

    throw error
  }
}


export async function sendPasswordResetEmail(email: string, storeId: string) {
  try {
    const user = await prismadb.storeUser.findFirst({
      where: {
        email,
        storeId,
      },
    })

    if (!user) {
      return { success: true }
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetTokenExp = new Date()
    resetTokenExp.setHours(resetTokenExp.getHours() + 24)
    await prismadb.storeUser.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp,
      },
    })

    const store = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}&storeId=${storeId}`

    const result = await queueEmail({
      type: "password-reset",
      payload: {
        userName: user.name,
        email: user.email,
        resetLink,
        expiryTime: "24 hours",
        storeName: store?.name || "Your Store",
        storeLogoUrl: store?.logoUrl || undefined,
      },
      metadata: {
        userId: user.id,
        storeId,
      },
    })

    return result
  } catch (error) {
    emailLogger.error({
      event: "send_password_reset_error",
      error,
      metadata: { email, storeId },
    })

    throw error
  }
}


export async function sendWelcomeEmail(userId: string, storeId: string) {
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com"
    const loginLink = `${baseUrl}/sign-in?storeId=${storeId}`

    const result = await queueEmail({
      type: "welcome",
      payload: {
        userName: user.name,
        email: user.email,
        loginLink,
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
      event: "send_welcome_email_error",
      error,
      metadata: { userId, storeId },
    })

    throw error
  }
}


export async function sendShippingUpdateEmail(
  orderId: string,
  trackingInfo: {
    trackingNumber: string
    trackingUrl: string
    carrier: string
    estimatedDelivery?: string
  },
) {
  try {
    const order = await prismadb.order.findUnique({
      where: { id: orderId },
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

    const result = await queueEmail({
      type: "shipping-update",
      payload: {
        customerName: order.name,
        customerEmail: order.email,
        orderNumber: order.orderNumber || order.id,
        trackingNumber: trackingInfo.trackingNumber,
        trackingUrl: trackingInfo.trackingUrl,
        carrier: trackingInfo.carrier,
        estimatedDelivery: trackingInfo.estimatedDelivery,
        shippingAddress: {
          line1: order.address || "",
          city: order.city || "",
          state: order.state || "",
          postalCode: order.zipCode || "",
          country: order.country || "",
        },
        storeName: store.name,
        storeLogoUrl: store.logoUrl || undefined,
        storeUrl: process.env.NEXT_PUBLIC_APP_URL || "https://yourstore.com",
      },
      metadata: {
        orderId,
        storeId: order.storeId,
      },
    })

    return result
  } catch (error) {
    emailLogger.error({
      event: "send_shipping_update_error",
      error,
      metadata: { orderId },
    })

    throw error
  }
}
