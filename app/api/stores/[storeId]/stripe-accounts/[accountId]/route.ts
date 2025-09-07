
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string; accountId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!params.accountId) {
      return new NextResponse("Account ID is required", { status: 400 })
    }

    const stripeAccount = await prismadb.stripeAccount.findUnique({
      where: {
        id: params.accountId,
        storeId: params.storeId,
      },
    })

    return NextResponse.json(stripeAccount)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; accountId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { name, publishableKey, secretKey, webhookSecret, isEnabled, isTestMode, isDefault } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!params.accountId) {
      return new NextResponse("Account ID is required", { status: 400 })
    }

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

    // If this account is set as default, unset any other default accounts
    if (isDefault) {
      await prismadb.stripeAccount.updateMany({
        where: {
          storeId: params.storeId,
          isDefault: true,
          NOT: {
            id: params.accountId,
          },
        },
        data: {
          isDefault: false,
        },
      })
    }

    const stripeAccount = await prismadb.stripeAccount.update({
      where: {
        id: params.accountId,
      },
      data: {
        name,
        publishableKey,
        secretKey,
        webhookSecret: webhookSecret || "",
        isEnabled: isEnabled || false,
        isTestMode: isTestMode || true,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(stripeAccount)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; accountId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!params.accountId) {
      return new NextResponse("Account ID is required", { status: 400 })
    }

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

    // Check if this is the default account
    const account = await prismadb.stripeAccount.findUnique({
      where: {
        id: params.accountId,
      },
    })

    // Delete the account
    await prismadb.stripeAccount.delete({
      where: {
        id: params.accountId,
      },
    })

    // If this was the default account, set another account as default if available
    if (account?.isDefault) {
      const nextAccount = await prismadb.stripeAccount.findFirst({
        where: {
          storeId: params.storeId,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (nextAccount) {
        await prismadb.stripeAccount.update({
          where: {
            id: nextAccount.id,
          },
          data: {
            isDefault: true,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
