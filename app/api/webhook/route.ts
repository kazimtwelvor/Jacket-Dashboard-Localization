
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import prismadb from "@/lib/prismadb"

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
}

async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  return Buffer.concat(chunks)
}

export async function POST(req: Request) {
  try {
    const buf = await buffer(req.body!)
    const rawBody = buf.toString("utf8")
    const signature = (await headers()).get("stripe-signature")
    if (!signature) {
      return new NextResponse("Missing signature header", { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: { stripeEnabled: true },
      select: { stripeSecretKey: true, stripeWebhookSecret: true },
    })

    if (!store?.stripeSecretKey || !store?.stripeWebhookSecret) {
      return new NextResponse("Stripe not configured", { status: 500 })
    }

    const stripe = new Stripe(store.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia", // Use stable API version
    })

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, store.stripeWebhookSecret)
    } catch (err: any) {
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCompletedCheckout(session)
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 })
  }
}

async function handleCompletedCheckout(session: Stripe.Checkout.Session) {
  try {
    const orderId = session?.metadata?.orderId

    if (!orderId) {
      return
    }

    const order = await prismadb.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return
    }

    const customerDetails = session.customer_details

    if (!customerDetails) {
      return
    }

    const address = customerDetails.address
    const addressComponents = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ]

    const addressString = addressComponents.filter((c) => c !== null && c !== undefined).join(", ")

    const paymentMethodDetails = session.payment_method_types?.[0] || session.payment_method || "stripe" // Default to "stripe" if no specific method found
    const paymentMethod = typeof paymentMethodDetails === "string" ? paymentMethodDetails.toUpperCase() : "STRIPE"
    const updatedOrder = await prismadb.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        address: addressString,
        phone: customerDetails.phone || "",
        customerEmail: customerDetails.email || "",
        billingAddress: addressString, // Also save as billing address
        transactionId: session.payment_intent as string,
        paymentStatus: "completed",
        paymentMethod: "stripe", // Already uppercase from above
        status: "PROCESSING",
      },
    })

  } catch (error) {
  }
}
