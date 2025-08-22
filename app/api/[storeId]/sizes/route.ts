// // import { NextResponse } from "next/server"
// // import { auth } from "@clerk/nextjs/server"
// // import prismadb from "@/lib/prismadb"

// // export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
// //   try {
// //     const { userId } = await auth()
// //     const body = await req.json()
// //     const { storeId } = await params

// //     const { name, value } = body

// //     if (!userId) {
// //       return new NextResponse("Unauthenticated", { status: 401 })
// //     }

// //     if (!name) {
// //       return new NextResponse("Name is required", { status: 400 })
// //     }

// //     if (!value) {
// //       return new NextResponse("Value is required", { status: 400 })
// //     }

// //     if (!storeId) {
// //       return new NextResponse("Store Id is required", { status: 400 })
// //     }

// //     const storeByUserId = await prismadb.store.findFirst({
// //       where: {
// //         id: storeId,
// //         userId,
// //       },
// //     })

// //     if (!storeByUserId) {
// //       return new NextResponse("Unauthorized", { status: 403 })
// //     }

// //     const size = await prismadb.size.create({
// //       data: {
// //         name,
// //         value,
// //         storeId: storeId,
// //       },
// //     })

// //     return NextResponse.json(size)
// //   } catch (error: any) {
// //     console.log(`[SIZES_POST]`)
// //     // Check if it's a unique constraint violation
// //     if (error.code === "P2002") {
// //       return new NextResponse("Size value already exists", {
// //         status: 409,
// //         statusText: "Unique constraint violation",
// //       })
// //     }
// //     return new NextResponse(`Internal error`, { status: 500 })
// //   }
// // }

// // export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
// //   try {
// //     const { storeId } = await params
// //     if (!storeId) {
// //       return new NextResponse("Store Id is required", { status: 400 })
// //     }

// //     const sizes = await prismadb.size.findMany({
// //       where: {
// //         storeId: storeId,
// //       },
// //     })

// //     return NextResponse.json(sizes)
// //   } catch (err) {
// //     console.log(`[SIZES_GET] ${err}`)
// //     return new NextResponse(`Internal error`, { status: 500 })
// //   }
// // }

// import { NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"
// import prismadb from "@/lib/prismadb"

// export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
//   try {
//     const { userId } = await auth()
//     const body = await req.json()
//     const { storeId } = await params

//     const { name, value } = body

//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     if (!name) {
//       return new NextResponse("Name is required", { status: 400 })
//     }

//     if (!value) {
//       return new NextResponse("Value is required", { status: 400 })
//     }

//     if (!storeId) {
//       return new NextResponse("Store Id is required", { status: 400 })
//     }

//     const storeByUserId = await prismadb.store.findFirst({
//       where: {
//         id: storeId,
//         userId,
//       },
//     })

//     if (!storeByUserId) {
//       return new NextResponse("Unauthorized", { status: 403 })
//     }

//     const size = await prismadb.size.create({
//       data: {
//         name,
//         value,
//         storeId: storeId,
//         // createdAt and updatedAt are handled automatically by Prisma
//       },
//     })

//     return NextResponse.json(size)
//   } catch (error: any) {
//     console.log(`[SIZES_POST]`, error)
//     // Check if it's a unique constraint violation
//     if (error.code === "P2002") {
//       return new NextResponse("Size value already exists", {
//         status: 409,
//         statusText: "Unique constraint violation",
//       })
//     }
//     return new NextResponse(`Internal error`, { status: 500 })
//   }
// }

// export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
//   try {
//     const { storeId } = await params
//     if (!storeId) {
//       return new NextResponse("Store Id is required", { status: 400 })
//     }

//     const sizes = await prismadb.size.findMany({
//       where: {
//         storeId: storeId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     })

//     return NextResponse.json(sizes)
//   } catch (err) {
//     console.log(`[SIZES_GET] ${err}`)
//     return new NextResponse(`Internal error`, { status: 500 })
//   }
// }

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { storeId } = await params

    const { name, value } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 })
    }

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: storeId,
        // createdAt and updatedAt are handled automatically by Prisma
      },
    })

    return NextResponse.json(size)
  } catch (error: any) {
    console.log(`[SIZES_POST]`, error)
    // Check if it's a unique constraint violation
    if (error.code === "P2002") {
      return new NextResponse("Size value already exists", {
        status: 409,
        statusText: "Unique constraint violation",
      })
    }
    return new NextResponse(`Internal error`, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params
    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 })
    }

    // Add CORS headers to the response
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(sizes, { headers })
  } catch (err) {
    console.log(`[SIZES_GET] ${err}`)
    return new NextResponse(`Internal error`, { status: 500 })
  }
}
