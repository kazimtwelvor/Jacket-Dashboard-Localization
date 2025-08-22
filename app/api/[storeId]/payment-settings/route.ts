import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    const paymentSettings = await prismadb.store.findUnique({
      where: {
        id: params.storeId,
      },
      select: {
        id: true,
        paypalClientId: true,
        paypalEnabled: true,
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
    })

    if (!paymentSettings) {
      return new NextResponse("Payment settings not found", { status: 404 })
    }

    return NextResponse.json(paymentSettings)
  } catch (error) {
    console.log("[PAYMENT_SETTINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
