
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

import prismadb from "@/lib/prismadb"

const storePaymentSchema = z.object({
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  paypalEnabled: z.boolean().default(false),
  paypalSandboxMode: z.boolean().default(true),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  stripeEnabled: z.boolean().default(false),
  stripeTestMode: z.boolean().default(true),
  cashOnDeliveryEnabled: z.boolean().default(false),
  cashOnDeliveryFee: z.coerce.number().default(0),
  bankTransferEnabled: z.boolean().default(false),
  bankTransferDetails: z.string().optional(),
  stripeAccounts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        publishableKey: z.string(),
        secretKey: z.string(),
        webhookSecret: z.string().optional(),
        isActive: z.boolean(),
      }),
    )
    .optional(),
})

export async function PATCH(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()


    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    // Validate the request body
    const validationResult = storePaymentSchema.safeParse(body)
    if (!validationResult.success) {
      return new NextResponse(`Validation error: ${validationResult.error.message}`, { status: 400 })
    }

    const {
      paypalClientId,
      paypalClientSecret,
      paypalEnabled,
      paypalSandboxMode,
      stripePublishableKey,
      stripeSecretKey,
      stripeWebhookSecret,
      stripeEnabled,
      stripeTestMode,
      cashOnDeliveryEnabled,
      cashOnDeliveryFee,
      bankTransferEnabled,
      bankTransferDetails,
      stripeAccounts,
    } = body

    // Check if the user has permission to update this store
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Prepare data for updating Stripe accounts
    const stripeAccountsUpdateData = stripeAccounts
      ? {
          deleteMany: {
            storeId: params.storeId,
          },
          createMany: {
            data: stripeAccounts.map((account: any) => ({
              id: account.id,
              name: account.name,
              publishableKey: account.publishableKey,
              secretKey: account.secretKey,
              webhookSecret: account.webhookSecret || "",
              isEnabled: account.isActive || false,
              isTestMode: stripeTestMode || true,
              isDefault: account.isActive || false,
            })),
          },
        }
      : undefined

    const updateData: any = {
      paypalClientId,
      paypalClientSecret,
      paypalEnabled,
      paypalSandboxMode,
      stripePublishableKey,
      stripeSecretKey,
      stripeWebhookSecret,
      stripeEnabled,
      stripeTestMode,
      cashOnDeliveryEnabled,
      cashOnDeliveryFee,
      bankTransferEnabled,
      bankTransferDetails,
      ...(stripeAccountsUpdateData ? { stripeAccounts: stripeAccountsUpdateData } : {}),
    }

    try {
      const updatedStore = await prismadb.store.update({
        where: {
          id: params.storeId,
        },
        data: updateData,
      })

      return NextResponse.json(updatedStore)
    } catch (dbError) {
      return new NextResponse(`Database error: ${(dbError as Error).message}`, { status: 500 })
    }
  } catch (error) {
    return new NextResponse(`Internal error: ${(error as Error).message}`, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    // First, check if the store has a stripeAccounts field
    let store
    try {
      store = await prismadb.store.findUnique({
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
    } catch (error) {
      // If the query fails because stripeAccounts doesn't exist, try again without it
      store = await prismadb.store.findUnique({
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
        },
      })
    }

    return NextResponse.json(store)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
