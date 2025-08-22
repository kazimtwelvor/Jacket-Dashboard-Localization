// import { NextResponse } from "next/server"
// import { headers } from "next/headers"
// import Stripe from "stripe"
// import prismadb from "@/lib/prismadb"

// // Critical: This must be exported from the route file
// export const config = {
//   api: {
//     bodyParser: false, // Disable Next.js body parsing
//   },
// }

// async function buffer(readable: ReadableStream<Uint8Array>) {
//   const reader = readable.getReader()
//   const chunks: Uint8Array[] = []

//   while (true) {
//     const { done, value } = await reader.read()
//     if (done) break
//     if (value) chunks.push(value)
//   }

//   return Buffer.concat(chunks)
// }

// export async function POST(req: Request) {
//   try {
//     // 1. Get the raw body exactly as received
//     const buf = await buffer(req.body!)
//     const rawBody = buf.toString("utf8")

//     // 2. Get the signature header
//     const signature = (await headers()).get("stripe-signature")
//     if (!signature) {
//       console.error("❌ Missing Stripe-Signature header")
//       return new NextResponse("Missing signature header", { status: 400 })
//     }

//     // 3. Get store configuration
//     const store = await prismadb.store.findFirst({
//       where: { stripeEnabled: true },
//       select: { stripeSecretKey: true, stripeWebhookSecret: true },
//     })

//     if (!store?.stripeSecretKey || !store?.stripeWebhookSecret) {
//       console.error("❌ Store with Stripe configuration not found")
//       return new NextResponse("Stripe not configured", { status: 500 })
//     }

//     // 4. Verify the webhook
//     const stripe = new Stripe(store.stripeSecretKey, {
//       apiVersion: "2025-02-24.acacia", // Use stable API version
//     })

//     let event: Stripe.Event
//     try {
//       event = stripe.webhooks.constructEvent(rawBody, signature, store.stripeWebhookSecret)
//       console.log(`✅ Webhook verified: ${event.id}`)
//     } catch (err: any) {
//       console.error(`❌ Webhook verification failed:`, {
//         error: err.message,
//         rawBodyLength: rawBody.length,
//         signature: signature,
//         secretPresent: !!store.stripeWebhookSecret,
//       })
//       return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
//     }

//     // 5. Handle events
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object as Stripe.Checkout.Session
//       await handleCompletedCheckout(session)
//     }

//     return new NextResponse(null, { status: 200 })
//   } catch (error) {
//     console.error("❌ Webhook processing error:", error)
//     return new NextResponse("Internal server error", { status: 500 })
//   }
// }

// async function handleCompletedCheckout(session: Stripe.Checkout.Session) {
//   try {
//     // Extract orderId from metadata
//     const orderId = session?.metadata?.orderId

//     if (!orderId) {
//       console.error("No order ID found in webhook metadata")
//       return
//     }

//     // Get the order
//     const order = await prismadb.order.findUnique({
//       where: { id: orderId },
//     })

//     if (!order) {
//       console.error(`Order ${orderId} not found`)
//       return
//     }

//     // Extract customer details from session
//     const customerDetails = session.customer_details

//     if (!customerDetails) {
//       console.error("No customer details in session")
//       return
//     }

//     // Format address
//     const address = customerDetails.address
//     const addressComponents = [
//       address?.line1,
//       address?.line2,
//       address?.city,
//       address?.state,
//       address?.postal_code,
//       address?.country,
//     ]

//     const addressString = addressComponents.filter((c) => c !== null && c !== undefined).join(", ")

//     // Get payment method details - try different Stripe API properties
//     const paymentMethodDetails = session.payment_method_types?.[0] || session.payment_method || "stripe" // Default to "stripe" if no specific method found

//     // Format the payment method name consistently
//     const paymentMethod = typeof paymentMethodDetails === "string" ? paymentMethodDetails.toUpperCase() : "STRIPE"

//     // Update the order with customer details
//     const updatedOrder = await prismadb.order.update({
//       where: { id: orderId },
//       data: {
//         isPaid: true,
//         address: addressString,
//         phone: customerDetails.phone || "",
//         customerEmail: customerDetails.email || "",
//         billingAddress: addressString, // Also save as billing address
//         transactionId: session.payment_intent as string,
//         paymentStatus: "completed",
//         paymentMethod: paymentMethod, // Already uppercase from above
//         status: "PROCESSING",
//       },
//     })

//     console.log(`✅ Order ${updatedOrder.id} updated with customer details:`, {
//       email: customerDetails.email,
//       phone: customerDetails.phone,
//       address: addressString,
//       paymentMethod: paymentMethod,
//     })
//   } catch (error) {
//     console.error("Error updating order with customer details:", error)
//   }
// }
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import prismadb from "@/lib/prismadb"

// Critical: This must be exported from the route file
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
    // 1. Get the raw body exactly as received
    const buf = await buffer(req.body!)
    const rawBody = buf.toString("utf8")

    // 2. Get the signature header
    const signature = (await headers()).get("stripe-signature")
    if (!signature) {
      console.error("❌ Missing Stripe-Signature header")
      return new NextResponse("Missing signature header", { status: 400 })
    }

    // 3. Get store configuration
    const store = await prismadb.store.findFirst({
      where: { stripeEnabled: true },
      select: { stripeSecretKey: true, stripeWebhookSecret: true },
    })

    if (!store?.stripeSecretKey || !store?.stripeWebhookSecret) {
      console.error("❌ Store with Stripe configuration not found")
      return new NextResponse("Stripe not configured", { status: 500 })
    }

    // 4. Verify the webhook
    const stripe = new Stripe(store.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia", // Use stable API version
    })

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, store.stripeWebhookSecret)
      console.log(`✅ Webhook verified: ${event.id}`)
    } catch (err: any) {
      console.error(`❌ Webhook verification failed:`, {
        error: err.message,
        rawBodyLength: rawBody.length,
        signature: signature,
        secretPresent: !!store.stripeWebhookSecret,
      })
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // 5. Handle events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCompletedCheckout(session)
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

async function handleCompletedCheckout(session: Stripe.Checkout.Session) {
  try {
    // Extract orderId from metadata
    const orderId = session?.metadata?.orderId

    if (!orderId) {
      console.error("No order ID found in webhook metadata")
      return
    }

    // Get the order
    const order = await prismadb.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return
    }

    // Extract customer details from session
    const customerDetails = session.customer_details

    if (!customerDetails) {
      console.error("No customer details in session")
      return
    }

    // Format address
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

    // Get payment method details - try different Stripe API properties
    const paymentMethodDetails = session.payment_method_types?.[0] || session.payment_method || "stripe" // Default to "stripe" if no specific method found

    // Format the payment method name consistently
    const paymentMethod = typeof paymentMethodDetails === "string" ? paymentMethodDetails.toUpperCase() : "STRIPE"

    // Update the order with customer details
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

    console.log(`✅ Order ${updatedOrder.id} updated with customer details:`, {
      email: customerDetails.email,
      phone: customerDetails.phone,
      address: addressString,
      paymentMethod: "stripe",
    })
  } catch (error) {
    console.error("Error updating order with customer details:", error)
  }
}
