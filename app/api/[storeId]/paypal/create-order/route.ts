import { NextResponse } from "next/server"
import paypal from "@paypal/checkout-server-sdk"
import { getPayPalClient } from "@/lib/paypal"
import prismadb from "@/lib/prismadb"
import { generateNextOrderId } from "@/lib/order-utils"

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
    const { items, customerId, customerData, paymentMethod = "paypal" } = await req.json()
    const { storeId } = params

    if (!items || items.length === 0) {
      return new NextResponse("Items are required", { status: 400 })
    }

    const productIds = items.map((item: any) => item.id)
    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        storeId,
      },
    })

    let orderTotal = 0
    const purchaseUnits = [
      {
        amount: {
          currency_code: "USD",
          value: "0", 
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: "0", 
            },
          },
        },
        items: [] as any[],
        ...(customerData && {
          shipping: {
            name: {
              full_name: customerData.name || "Customer"
            },
            address: {
              address_line_1: customerData.address || "",
              admin_area_2: customerData.city || "",
              admin_area_1: customerData.state || "",
              postal_code: customerData.zipCode || "",
              country_code: customerData.country || "US"
            }
          }
        })
      },
    ]

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

    purchaseUnits[0].amount.value = orderTotal.toFixed(2)
    purchaseUnits[0].amount.breakdown.item_total.value = orderTotal.toFixed(2)

    const paypalClient = await getPayPalClient(storeId)
    const request = new paypal.orders.OrdersCreateRequest()
    request.headers["prefer"] = "return=representation"
    
    const requestBody: any = {
      intent: "CAPTURE",
      purchase_units: purchaseUnits,
      application_context: {
        brand_name: "Your Store Name",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_STORE_URL}/checkout/success`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/checkout/cancel`,
      },
    }

    // Add payer information if customer data is provided
    if (customerData) {
      requestBody.payer = {
        name: {
          given_name: customerData.name?.split(' ')[0] || "Customer",
          surname: customerData.name?.split(' ').slice(1).join(' ') || ""
        },
        email_address: customerData.email,
        phone: customerData.phone ? {
          phone_number: {
            national_number: customerData.phone
          }
        } : undefined
      }
    }

    // For card payments, add payment source
    if (paymentMethod === "card") {
      requestBody.payment_source = {
        card: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "Your Store Name",
            locale: "en-US",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW"
          }
        }
      }
    }

    request.requestBody(requestBody)

    const response = await paypalClient.execute(request)

    if (response.statusCode !== 201) {
      return new NextResponse("Failed to create PayPal order", { status: 500 })
    }

    // Calculate total price for database
    let totalPrice = products.reduce((sum, product) => sum + Number(product.price), 0)

    // Generate sequential order ID
    const orderId = await generateNextOrderId(storeId)

    const order = await prismadb.order.create({
      data: {
        id: orderId,
        storeId,
        isPaid: false,
        total: totalPrice,
        paymentIntentId: response.result.id,
        paymentMethod: paymentMethod === "card" ? "PAYPAL_CARD" : "PAYPAL",
        paymentStatus: "pending",
        ...(customerId && { customerId }),
        ...(customerData && {
          customerEmail: customerData.email,
          customerName: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          country: customerData.country,
          zipCode: customerData.zipCode
        }),
        orderItems: {
          create: items.map((item: any) => {
            const product = products.find(p => p.id === item.id)
            return {
              product: {
                connect: {
                  id: item.id,
                },
              },
              quantity: item.quantity || 1,
              price: product?.price || 0,
              total: Number(product?.price || 0) * (item.quantity || 1)
            }
          }),
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
    console.error("[PAYPAL_CREATE_ORDER_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
