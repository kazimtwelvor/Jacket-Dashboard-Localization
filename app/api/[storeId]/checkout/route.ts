import prismadb from "@/lib/prismadb";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";
import { generateNextOrderId } from "@/lib/order-utils";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const {
      productIds,
      paymentMethod = "stripe",
      customerEmail,
      phone,
      address,
      billingAddress,
      shippingAddress,
      embedded = false, // New parameter to determine if we should use embedded checkout
      voucherCode, // Add voucher code parameter
      discountAmount = 0, // Add discount amount parameter
      state,
      country,
      city,
      zipCode,
      customerName,
      notes,
    } = await req.json();
    const { storeId } = params;

    if (!productIds || productIds.length === 0) {
      return new NextResponse("Product ids are required", { status: 400 });
    }

    // Get store settings including payment configuration
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        stripeEnabled: true,
        stripeSecretKey: true,
        stripeTestMode: true,
        paypalEnabled: true,
        cashOnDeliveryEnabled: true,
        bankTransferEnabled: true,
      },
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    // Validate that the selected payment method is enabled
    if (paymentMethod === "stripe" && !store.stripeEnabled) {
      return new NextResponse(
        "Stripe payments are not enabled for this store",
        {
          status: 400,
        }
      );
    } else if (paymentMethod === "paypal" && !store.paypalEnabled) {
      return new NextResponse(
        "PayPal payments are not enabled for this store",
        {
          status: 400,
        }
      );
    } else if (paymentMethod === "cash" && !store.cashOnDeliveryEnabled) {
      return new NextResponse(
        "Cash on delivery is not enabled for this store",
        {
          status: 400,
        }
      );
    } else if (paymentMethod === "bank" && !store.bankTransferEnabled) {
      return new NextResponse("Bank transfer is not enabled for this store", {
        status: 400,
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Calculate total price once for all payment methods
    let totalPrice = products.reduce(
      (sum, product) => sum + Number(product.price),
      0
    );

    // Apply voucher discount if provided
    let finalTotal = totalPrice;
    if (voucherCode && discountAmount > 0) {
      finalTotal = Math.max(0, totalPrice - discountAmount);
    }

    // Create order data common to all payment methods
    const orderData = {
      storeId: storeId,
      isPaid: false,
      total: finalTotal,
      discount: discountAmount,
      orderItems: {
        create: products.map((product) => ({
          product: {
            connect: {
              id: product.id,
            },
          },
          price: product.price,
          quantity: 1,
          total: product.price,
        })),
      },
    };

    // Handle different payment methods
    if (paymentMethod === "stripe") {
      if (!store.stripeSecretKey) {
        return new NextResponse(
          "Stripe is not properly configured for this store",
          { status: 400 }
        );
      }

      // Initialize Stripe with the store's secret key
      const stripe = new Stripe(store.stripeSecretKey, {
        apiVersion: "2025-02-24.acacia",
      });
      const orderId = await generateNextOrderId(storeId);
      // Create order in database
      const order = await prismadb.order.create({
        data: {
          id: orderId,
          ...orderData,
          paymentMethod: "stripe", // Ensure this is lowercase to match the form value
          paymentStatus: "pending",
          customerEmail: customerEmail || null,
          phone: phone || "",
          address: address || "",
          billingAddress: billingAddress || null,
          shippingAddress: shippingAddress || null,
          state,
          country: country || "",
          city: city || "",
          zipCode: zipCode || "",
          customerName: customerName || "",
          notes: notes || "",
        },
      });

      // For embedded checkout, create a payment intent instead of a checkout session
      if (embedded) {
        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(Number(finalTotal) * 100), // Convert to cents
          currency: "usd",
          metadata: {
            orderId: order.id,
            storeId: storeId,
            voucherCode: voucherCode || "",
            discountAmount: discountAmount.toString(),
          },
        });

        return NextResponse.json(
          {
            clientSecret: paymentIntent.client_secret
              ? encrypt(paymentIntent.client_secret)
              : null,
            orderId: order.id,
          },
          { headers: corsHeaders }
        );
      } else {
        // Traditional redirect checkout flow
        // Prepare line items for Stripe checkout
        const line_items = products.map((product) => ({
          quantity: 1,
          price_data: {
            currency: "USD",
            product_data: {
              name: product.name,
            },
            unit_amount: Math.round(Number(product.price) * 100), // Ensure integer
          },
        }));

        // Add discount as a separate line item if applicable
        if (voucherCode && discountAmount > 0) {
          line_items.push({
            quantity: 1,
            price_data: {
              currency: "USD",
              product_data: {
                name: `Discount (${voucherCode})`,
              },
              unit_amount: -Math.round(Number(discountAmount) * 100), // Negative amount for discount
            },
          });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          line_items,
          mode: "payment",
          payment_method_types: ["card"], // Explicitly specify payment methods
          billing_address_collection: "required", // Force address collection
          shipping_address_collection: {
            allowed_countries: ["US", "CA", "GB", "AU"], // Add more countries as needed
          },
          phone_number_collection: {
            enabled: true,
          },
          custom_text: {
            shipping_address: {
              message:
                "Please provide your complete shipping address for delivery",
            },
            submit: {
              message: "We'll process your order right after payment",
            },
          },
          success_url: `${process.env.FRONTEND_STORE_URL || "http://localhost:3000"}/checkout/confirmation?orderId=${
            order.id
          }&success=1`,
          cancel_url: `${process.env.FRONTEND_STORE_URL || "http://localhost:3000"}/cart?cancelled=1`,
          metadata: {
            orderId: order.id,
            storeId: storeId,
            source: "checkout_api",
            voucherCode: voucherCode || "",
            discountAmount: discountAmount.toString(),
          },
        });

        return NextResponse.json(
          { url: session.url },
          { headers: corsHeaders }
        );
      }
    } else if (paymentMethod === "cash" || paymentMethod === "bank") {
      // Create order for cash on delivery or bank transfer
      const order = await prismadb.order.create({
        data: {
          ...orderData,
          paymentMethod:
            paymentMethod === "cash" ? "CASH_ON_DELIVERY" : "BANK_TRANSFER",
        },
      });

      return NextResponse.json(
        {
          url: `${process.env.FRONTEND_STORE_URL}/checkout/confirmation?orderId=${order.id}&method=${paymentMethod}`,
        },
        { headers: corsHeaders }
      );
    } else {
      // Handle PayPal case
      return NextResponse.json(
        {
          error:
            "For PayPal payments, please use the PayPal button on the checkout page",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
