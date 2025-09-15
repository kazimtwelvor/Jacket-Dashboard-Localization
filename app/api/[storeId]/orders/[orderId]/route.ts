import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { checkApiPermission, getPermissionForMethod } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string; orderId: string }> }) {
  try {
    const { storeId, orderId } = await params
    
    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.VIEW_ORDERS, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view orders.", { status: 403 })
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  include: {
                    image: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    })

    const serializedOrder = order ? {
      ...order,
      shippingCost: Number(order.shippingCost),
      // tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      orderItems: order.orderItems.map(item => ({
        ...item,
        price: Number(item.price),
        // originalPrice: Number(item.originalPrice),
        discountAmount: Number(item.discountAmount),
        total: Number(item.total)
      }))
    } : null

    return NextResponse.json(serializedOrder)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string; orderId: string }> }) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { storeId, orderId } = await params

    const {
      userId: customerId,
      customerName,
      phone,
      address,
      isPaid,
      status,
      paymentMethod,
      shippingMethod,
      shippingCost,
      // tax,
      discount,
      total,
      notes,
      // trackingNumber,
      customerEmail,
      billingAddress,
      shippingAddress,
      city,
      country,
      state,
      zipCode,
      // fulfillmentStatus,
      // estimatedDelivery,
      // actualDelivery,
      transactionId,
      paymentStatus,
      // cardNumber,
      // expirationDate,
      // securityCode,
      // cardCountry,
      orderItems,
    } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.MANAGE_ORDERS, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to update orders.", { status: 403 })
    }

    let finalUserId = null
    if (customerId) {
      const existingUser = await prismadb.user.findUnique({
        where: { id: customerId }
      })
      
      if (existingUser) {
        finalUserId = customerId
      }
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      const dbUser = await prismadb.user.findFirst({
        where: {
          clerkId: userId,
        },
      })

      if (!dbUser) {
        return new NextResponse("Unauthorized", { status: 403 })
      }

      const storeMember = await prismadb.storeUser.findFirst({
        where: {
          storeId: storeId,
          userId: dbUser.id,
        },
      })

       if (!storeMember || !storeMember.permissions.includes("MANAGE_ORDERS")) {
         return new NextResponse("Unauthorized", { status: 403 })
       }
    }

    let order = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        userId: finalUserId,
        customerName: customerName !== undefined ? customerName : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        isPaid: isPaid !== undefined ? isPaid : undefined,
        status: status !== undefined ? status : undefined,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : undefined,
        shippingMethod: shippingMethod !== undefined ? shippingMethod : undefined,
        shippingCost: shippingCost !== undefined ? shippingCost : undefined,
        // tax: tax !== undefined ? tax : undefined,
        discount: discount !== undefined ? discount : undefined,
        total: total !== undefined ? total : undefined,
        notes: notes !== undefined ? notes : undefined,
        // trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
        customerEmail: customerEmail !== undefined ? customerEmail : undefined,
        billingAddress: billingAddress !== undefined ? billingAddress : undefined,
        shippingAddress: shippingAddress !== undefined ? shippingAddress : undefined,
        city: city !== undefined ? city : undefined,
        country: country !== undefined ? country : undefined,
        state: state !== undefined ? state : undefined,
        zipCode: zipCode !== undefined ? zipCode : undefined,
        // fulfillmentStatus: fulfillmentStatus !== undefined ? fulfillmentStatus : undefined,
        // estimatedDelivery:
        //   estimatedDelivery !== undefined ? (estimatedDelivery ? new Date(estimatedDelivery) : null) : undefined,
        // actualDelivery: actualDelivery !== undefined ? (actualDelivery ? new Date(actualDelivery) : null) : undefined,
        transactionId: transactionId !== undefined ? transactionId : undefined,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
        // cardNumber: cardNumber !== undefined ? cardNumber : undefined,
        // expirationDate: expirationDate !== undefined ? expirationDate : undefined,
        // securityCode: securityCode !== undefined ? securityCode : undefined,
        // cardCountry: cardCountry !== undefined ? cardCountry : undefined,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  include: {
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (orderItems && Array.isArray(orderItems)) {
      await prismadb.orderItem.deleteMany({
        where: {
          orderId: orderId,
        },
      })

      if (orderItems.length > 0) {
        await prismadb.orderItem.createMany({
          data: orderItems.map((item: any) => ({
            orderId: orderId,
            productId: item.productId,
            quantity: item.quantity || 1,
            price: item.price,
            // originalPrice: item.originalPrice || item.price,
            discountAmount: item.discountAmount || 0,
            total: item.total || item.price * (item.quantity || 1),
            sizeIds: item.sizeIds || [],
            colorIds: item.colorIds || [],
            selectedOptions: item.selectedOptions || {},
            productSku: item.productSku || null,
            productName: item.productName || null,
            customerName: item.customerName || "Customer",
          })),
        })
      }

      const updatedOrder = await prismadb.order.findUnique({
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

      order = updatedOrder || order
    }

    const serializedOrder = {
      ...order,
      shippingCost: Number(order.shippingCost),
      // tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      orderItems: order.orderItems?.map(item => ({
        ...item,
        price: Number(item.price),
        // originalPrice: Number(item.originalPrice),
        discountAmount: Number(item.discountAmount),
        total: Number(item.total)
      })) || []
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string; orderId: string }> }) {
  try {
    const { userId } = await auth()
    const { storeId, orderId } = await params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.MANAGE_ORDERS, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete orders.", { status: 403 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      const dbUser = await prismadb.user.findFirst({
        where: {
          clerkId: userId,
        },
      })

      if (!dbUser) {
        return new NextResponse("Unauthorized", { status: 403 })
      }

      const storeMember = await prismadb.storeUser.findFirst({
        where: {
          storeId: storeId,
          userId: dbUser.id,
        },
      })

       if (!storeMember || !storeMember.permissions.includes("MANAGE_ORDERS")) {
         return new NextResponse("Unauthorized", { status: 403 })
       }
    }

    await prismadb.orderItem.deleteMany({
      where: {
        orderId: orderId,
      },
    })

    const order = await prismadb.order.delete({
      where: {
        id: orderId,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
