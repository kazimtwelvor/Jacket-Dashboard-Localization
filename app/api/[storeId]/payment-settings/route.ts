import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import prismadb from "@/lib/prismadb";
import { encrypt } from "@/lib/encryption";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or restrict to specific origin
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const paymentSettings = await prismadb.store.findUnique({
      where: {
        id: params.storeId,
      },
      select: {
        id: true,
        paypalEnabled: true,
        paypalClientId: true,
        paypalClientSecret: true,
        paypalSandboxMode: true,
        stripePublishableKey: true,
        stripeSecretKey: true,
        stripeWebhookSecret: true,
        stripeEnabled: true,
        stripeTestMode: true,
        cashOnDeliveryEnabled: true,
        cashOnDeliveryFee: true,
        bankTransferEnabled: true,
        bankTransferDetails: true,
        stripeAccounts: true,
      },
    });

    if (!paymentSettings) {
      return new NextResponse("Payment settings not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Encrypt sensitive PayPal credentials
    const encryptedSettings = {
      ...paymentSettings,
      paypalClientId: paymentSettings.paypalClientId
        ? encrypt(paymentSettings.paypalClientId)
        : null,
      paypalClientSecret: paymentSettings.paypalClientSecret
        ? encrypt(paymentSettings.paypalClientSecret)
        : null,
      stripePublishableKey: paymentSettings.stripePublishableKey
        ? encrypt(paymentSettings.stripePublishableKey)
        : null,
      stripeSecretKey: paymentSettings.stripeSecretKey
        ? encrypt(paymentSettings.stripeSecretKey)
        : null,
      stripeWebhookSecret: paymentSettings.stripeWebhookSecret
        ? encrypt(paymentSettings.stripeWebhookSecret)
        : null,
    };

    return NextResponse.json(encryptedSettings, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.log("[PAYMENT_SETTINGS_GET]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// Handle CORS preflight (OPTIONS request)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
