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
    const { items, customerId } = await req.json()
    const { storeId } = params

    if (!items || items.length === 0) {
      return new NextResponse("Items are required", { status: 400 })
    }

    // Fetch products from database to get accurate prices
    const productIds = items.map((item: any) => item.id)
    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        storeId,
      },
    })

    // Calculate order total
    let orderTotal = 0
    const purchaseUnits = [
      {
        amount: {
          currency_code: "USD",
          value: "0", // Will be updated below
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: "0", // Will be updated below
            },
          },
        },
        items: [] as any[],
      },
    ]

    // Create line items for PayPal
    items.forEach((item: any) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) return

      const quantity = item.quantity || 1
      const price = Number.parseFloat(product.price.toString())
      const itemTotal = price * quantity
      orderTotal += itemTotal

      purchaseUnits[0].items.push({
        name: product.name,
        unit_amount: {
          currency_code: "USD",
          value: price.toFixed(2),
        },
        quantity: quantity.toString(),
      })
    })

    // Update totals
    purchaseUnits[0].amount.value = orderTotal.toFixed(2)
    purchaseUnits[0].amount.breakdown.item_total.value = orderTotal.toFixed(2)

    // Create PayPal order
    const paypalClient = await getPayPalClient(storeId)
    const request = new paypal.orders.OrdersCreateRequest()
    request.headers["prefer"] = "return=representation"
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: purchaseUnits,
      application_context: {
        brand_name: "Your Store Name",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_STORE_URL}/checkout/success`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/checkout/cancel`,
      },
    })

    const response = await paypalClient.execute(request)

    if (response.statusCode !== 201) {
      return new NextResponse("Failed to create PayPal order", { status: 500 })
    }

    // Create a pending order in our database
    const order = await prismadb.order.create({
      data: {
        storeId,
        isPaid: false,
        paymentIntentId: response.result.id,
        paymentMethod: "PAYPAL",
        ...(customerId && { customerId }),
        orderItems: {
          create: items.map((item: any) => ({
            product: {
              connect: {
                id: item.id,
              },
            },
            quantity: item.quantity || 1,
          })),
        },
      },
    })

    return NextResponse.json(
      {
        orderId: response.result.id,
        dbOrderId: order.id,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
