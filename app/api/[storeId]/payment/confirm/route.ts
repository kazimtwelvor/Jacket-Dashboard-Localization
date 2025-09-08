import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"
import { getStripeForStore } from "@/lib/stripe"

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
    const { storeId } = params
    const { paymentIntentId, orderId } = await req.json()

    if (!paymentIntentId) {
      return new NextResponse("Payment intent ID is required", { status: 400 })
    }

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    // Get the Stripe instance for this store
    const stripe = await getStripeForStore(storeId)

    // Retrieve the payment intent to verify its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return new NextResponse(`Payment not successful. Status: ${paymentIntent.status}`, { status: 400 })
    }

    // Update the order as paid
    const updatedOrder = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        paymentStatus: "completed",
      },
    })

    return NextResponse.json(
      {
        success: true,
        order: updatedOrder,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
