
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const paymentStatus = searchParams.get("paymentStatus") || undefined
    const fulfillmentStatus = searchParams.get("fulfillmentStatus") || undefined
    const customerId = searchParams.get("customerId") || undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        ...(status && { status: status as any }),
        ...(paymentStatus && { paymentStatus }),
        // ...(fulfillmentStatus && { fulfillmentStatus }),
        ...(customerId && { userId: customerId }),
      },
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
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    const totalCount = await prismadb.order.count({
      where: {
        storeId: params.storeId,
        ...(status && { status: status as any }),
        ...(paymentStatus && { paymentStatus }),
        // ...(fulfillmentStatus && { fulfillmentStatus }),
        ...(customerId && { userId: customerId }),
      },
    })

    const serializedOrders = orders.map(order => ({
      ...order,
      shippingCost: Number(order.shippingCost),
      // tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      orderItems: order?.orderItems?.map(item => ({
        ...item,
        price: Number(item.price),
        // originalPrice: Number(item.originalPrice),
        discountAmount: Number(item.discountAmount),
        total: Number(item.total)
      }))
    }))

    return NextResponse.json({
      orders: serializedOrders,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const {
      userId: customerId,
      customerName,
      phone,
      address,
      isPaid,
      orderItems,
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
    } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.MANAGE_ORDERS, 'POST')
    
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to create orders.", { status: 403 })
    }

    if (!orderItems || !orderItems.length) {
      return new NextResponse("Order items are required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
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
          storeId: params.storeId,
          userId: dbUser.id,
        },
      })

       if (!storeMember || !storeMember.permissions.includes("MANAGE_ORDERS")) {
         return new NextResponse("Unauthorized", { status: 403 })
       }
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

    const order = await prismadb.order.create({
      data: {
        storeId: params.storeId,
        userId: finalUserId,
        customerName: customerName || null,
        phone: phone || "",
        address: address || "",
        isPaid: isPaid || false,
        status: status || "PENDING",
        paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : null,
        shippingMethod: shippingMethod || null,
        shippingCost: shippingCost || 0,
        // tax: tax || 0,
        discount: discount || 0,
        total: total || 0,
        notes: notes || null,
        // trackingNumber: trackingNumber || null,
        customerEmail: customerEmail || null,
        billingAddress: billingAddress || null,
        shippingAddress: shippingAddress || null,
        city: city || null,
        country: country || null,
        state: state || null,
        zipCode: zipCode || null,
        // fulfillmentStatus: fulfillmentStatus || "pending",
        // estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        // actualDelivery: actualDelivery ? new Date(actualDelivery) : null,
        transactionId: transactionId || null,
        paymentStatus: paymentStatus || "pending",
        // cardNumber: cardNumber || null,
        // expirationDate: expirationDate || null,
        // securityCode: securityCode || null,
        // cardCountry: cardCountry || null,
        orderItems: {
          createMany: {
            data: orderItems.map((item: any) => ({
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
          },
        },
      },
      include: {
        orderItems: true,
      },
    })

    const serializedOrder = {
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
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
}
