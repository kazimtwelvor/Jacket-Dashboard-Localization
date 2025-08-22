// import { NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"

// import prismadb from "@/lib/prismadb"

// export async function POST(req: Request, { params }: { params: { storeId: string } }) {
//   try {
//     const { userId } = await auth()
//     const body = await req.json()

//     const { name, publishableKey, secretKey, webhookSecret, isEnabled, isTestMode, isDefault } = body

//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     if (!params.storeId) {
//       return new NextResponse("Store ID is required", { status: 400 })
//     }

//     if (!name) {
//       return new NextResponse("Account name is required", { status: 400 })
//     }

//     if (!publishableKey) {
//       return new NextResponse("Publishable key is required", { status: 400 })
//     }

//     if (!secretKey) {
//       return new NextResponse("Secret key is required", { status: 400 })
//     }

//     // Check if the user has permission to update this store
//     const storeByUserId = await prismadb.store.findFirst({
//       where: {
//         id: params.storeId,
//         userId,
//       },
//     })

//     if (!storeByUserId) {
//       return new NextResponse("Unauthorized", { status: 403 })
//     }

//     // If this account is set as default, unset any other default accounts
//     if (isDefault) {
//       await prismadb.stripeAccount.updateMany({
//         where: {
//           storeId: params.storeId,
//           isDefault: true,
//         },
//         data: {
//           isDefault: false,
//         },
//       })
//     }

//     const stripeAccount = await prismadb.stripeAccount.create({
//       data: {
//         storeId: params.storeId,
//         name,
//         publishableKey,
//         secretKey,
//         webhookSecret: webhookSecret || "",
//         isEnabled: isEnabled || false,
//         isTestMode: isTestMode || true,
//         isDefault: isDefault || false,
//       },
//     })

//     return NextResponse.json(stripeAccount)
//   } catch (error) {
//     console.log("[STRIPE_ACCOUNTS_POST]", error)
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }

// export async function GET(req: Request, { params }: { params: { storeId: string } }) {
//   try {
//     if (!params.storeId) {
//       return new NextResponse("Store ID is required", { status: 400 })
//     }

//     const stripeAccounts = await prismadb.stripeAccount.findMany({
//       where: {
//         storeId: params.storeId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     })

//     return NextResponse.json(stripeAccounts)
//   } catch (error) {
//     console.log("[STRIPE_ACCOUNTS_GET]", error)
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
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

    if (!name) {
      return new NextResponse("Account name is required", { status: 400 })
    }

    if (!publishableKey) {
      return new NextResponse("Publishable key is required", { status: 400 })
    }

    if (!secretKey) {
      return new NextResponse("Secret key is required", { status: 400 })
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
        },
        data: {
          isDefault: false,
        },
      })
    }

    const stripeAccount = await prismadb.stripeAccount.create({
      data: {
        storeId: params.storeId,
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
    console.log("[STRIPE_ACCOUNTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    console.log(`Fetching Stripe accounts for store: ${params.storeId}`)

    const stripeAccounts = await prismadb.stripeAccount.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`Found ${stripeAccounts.length} Stripe accounts`)

    return NextResponse.json(stripeAccounts)
  } catch (error) {
    console.log("[STRIPE_ACCOUNTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
