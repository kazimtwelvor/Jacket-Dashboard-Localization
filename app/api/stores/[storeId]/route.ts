// import prismadb from "@/lib/prismadb"
// import { auth } from "@clerk/nextjs/server"
// import { NextResponse } from "next/server"

// export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
//   try {
//     // Await params if it's a Promise
//     const resolvedParams = params instanceof Promise ? await params : params
//     const { storeId } = resolvedParams

//     if (!storeId) {
//       return new NextResponse("Store id is required", { status: 400 })
//     }

//     const store = await prismadb.store.findUnique({
//       where: {
//         id: storeId,
//       },
//       // Make sure to select all fields including url
//       select: {
//         id: true,
//         name: true,
//         userId: true,
//         createdAt: true,
//         updatedAt: true,
//         logoUrl: true,
//         description: true,
//         email: true,
//         phone: true,
//         address: true,
//         city: true,
//         state: true,
//         zipCode: true,
//         country: true,
//         facebook: true,
//         instagram: true,
//         twitter: true,
//         skuPrefix: true,
//         url: true, // Make sure url is included
//       },
//     })

//     return NextResponse.json(store)
//   } catch (error) {
//     console.log("[STORE_GET]", error instanceof Error ? error.message : "Unknown error")
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }

// // For Next.js App Router, we need to use Promise<{ storeId: string }> for params
// export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
//   try {
//     const { userId } = await auth()

//     // Await params if it's a Promise
//     const resolvedParams = params instanceof Promise ? await params : params
//     const { storeId } = resolvedParams

//     const body = await req.json()

//     const {
//       name,
//       logo,
//       description,
//       contactEmail,
//       contactPhone,
//       address,
//       city,
//       state,
//       zipCode,
//       country,
//       currency, // This doesn't exist in the schema
//       taxRate,
//       enableReviews,
//       facebookUrl,
//       instagramUrl,
//       twitterUrl,
//       primaryColor,
//       skuPrefix, // New field
//       url, // Add url field
//     } = body

//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     if (!name) {
//       return new NextResponse("Name is required", { status: 400 })
//     }

//     if (!storeId) {
//       return new NextResponse("Store id is required", { status: 400 })
//     }

//     // Only include fields that exist in the schema
//     const store = await prismadb.store.updateMany({
//       where: {
//         id: storeId,
//         userId,
//       },
//       data: {
//         name,
//         ...(logo !== undefined && { logoUrl: logo }),
//         ...(description !== undefined && { description }),
//         ...(contactEmail !== undefined && { email: contactEmail }),
//         ...(contactPhone !== undefined && { phone: contactPhone }),
//         ...(address !== undefined && { address }),
//         ...(city !== undefined && { city }),
//         ...(state !== undefined && { state }),
//         ...(zipCode !== undefined && { zipCode }),
//         ...(country !== undefined && { country }),
//         ...(facebookUrl !== undefined && { facebook: facebookUrl }),
//         ...(instagramUrl !== undefined && { instagram: instagramUrl }),
//         ...(twitterUrl !== undefined && { twitter: twitterUrl }),
//         ...(skuPrefix !== undefined && { skuPrefix }),
//         ...(url !== undefined && { url }), // Add the url field

//         // Remove fields that don't exist in the schema
//         // ...(currency !== undefined && { currency }),
//         // ...(taxRate !== undefined && { taxRate }),
//         // ...(enableReviews !== undefined && { enableReviews }),
//         // ...(primaryColor !== undefined && { primaryColor }),
//       },
//     })

//     return NextResponse.json(store)
//   } catch (error) {
//     console.log("[STORE_PATCH]", error instanceof Error ? error.message : "Unknown error")
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }

// export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
//   try {
//     const { userId } = await auth()

//     // Await params if it's a Promise
//     const resolvedParams = params instanceof Promise ? await params : params
//     const { storeId } = resolvedParams

//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     if (!storeId) {
//       return new NextResponse("Store id is required", { status: 400 })
//     }

//     const store = await prismadb.store.deleteMany({
//       where: {
//         id: storeId,
//         userId,
//       },
//     })

//     return NextResponse.json(store)
//   } catch (error) {
//     console.log("[STORE_DELETE]", error instanceof Error ? error.message : "Unknown error")
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }

import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
  try {
    // Await params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params
    const { storeId } = resolvedParams

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      // Make sure to select all fields including url
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        skuPrefix: true,
        url: true, // Make sure url is included
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_GET]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal error", { status: 500 })
  }
}

// For Next.js App Router, we need to use Promise<{ storeId: string }> for params
export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
  try {
    const { userId } = await auth()

    // Await params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params
    const { storeId } = resolvedParams

    const body = await req.json()

    const { name, skuPrefix, url } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    // Only include fields that exist in the schema
    const store = await prismadb.store.updateMany({
      where: {
        id: storeId,
        userId,
      },
      data: {
        name,
        ...(skuPrefix !== undefined && { skuPrefix }),
        ...(url !== undefined && { url }),
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_PATCH]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
  try {
    const { userId } = await auth()

    // Await params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params
    const { storeId } = resolvedParams

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: storeId,
        userId,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_DELETE]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal error", { status: 500 })
  }
}
