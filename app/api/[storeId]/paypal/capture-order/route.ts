import { NextResponse } from "next/server"
import paypal from "@paypal/checkout-server-sdk"
import { getPayPalClient } from "@/lib/paypal"
import prismadb from "@/lib/prismadb"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { orderID } = await req.json()
    const { storeId } = params

    if (!orderID) {
      return new NextResponse("PayPal Order ID is required", { status: 400 })
    }

    // Capture the PayPal order
    const paypalClient = await getPayPalClient(storeId)
    const request = new paypal.orders.OrdersCaptureRequest(orderID)
    request.requestBody({})

    const response = await paypalClient.execute(request)

    if (!response) {
      return new NextResponse("Failed to capture PayPal order", { status: 500 })
    }

    // Find the order in our database
    const order = await prismadb.order.findFirst({
      where: {
        paymentIntentId: orderID,
        storeId,
      },
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    // Update the order to paid
    const updatedOrder = await prismadb.order.update({
      where: {
        id: order.id,
      },
      data: {
        isPaid: true,
        paymentDetails: JSON.stringify(response.result),
      },
      include: {
        orderItems: true,
      },
    })

    // Update product inventory if needed
    for (const item of updatedOrder.orderItems) {
      await prismadb.product.update({
        where: {
          id: item.productId,
        },
        data: {
          // Decrement inventory
          inventory: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { headers: corsHeaders })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
