import { NextResponse } from "next/server";
import { 
  sendMetaConversionEvent,
  trackViewContentServer,
  trackAddToCartServer,
  trackInitiateCheckoutServer,
  trackPurchaseServer,
  trackLeadServer,
  trackSearchServer
} from "@/lib/meta-conversions-api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventType, eventData, userData } = body;

    let result;

    switch (eventType) {
      case 'ViewContent':
        result = await trackViewContentServer(
          req,
          eventData.productId,
          eventData.productName,
          eventData.price,
          eventData.category,
          userData
        );
        break;

      case 'AddToCart':
        result = await trackAddToCartServer(
          req,
          eventData.productId,
          eventData.productName,
          eventData.price,
          eventData.quantity,
          userData
        );
        break;

      case 'InitiateCheckout':
        result = await trackInitiateCheckoutServer(
          req,
          eventData.cartItems,
          eventData.totalValue,
          userData
        );
        break;

      case 'Purchase':
        result = await trackPurchaseServer(
          req,
          eventData.orderId,
          eventData.orderItems,
          eventData.totalValue,
          userData
        );
        break;

      case 'Lead':
        result = await trackLeadServer(req, userData);
        break;

      case 'Search':
        result = await trackSearchServer(
          req,
          eventData.searchQuery,
          userData
        );
        break;

      case 'Custom':
        result = await sendMetaConversionEvent(req, {
          eventName: eventData.eventName,
          ...eventData,
          ...userData
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400, headers: corsHeaders }
        );
    }

    return NextResponse.json(result, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error processing Meta event:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
