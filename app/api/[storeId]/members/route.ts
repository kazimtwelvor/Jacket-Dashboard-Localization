// import { NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"

// import { db } from "@/lib/db"

// export async function GET(req: Request, { params }: { params: { storeId: string } }) {
//   try {
//     const { userId } = await auth()

//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     // Check if user has access to this store
//     const storeUser = await db.storeUser.findFirst({
//       where: {
//         userId,
//         storeId: params.storeId,
//       },
//     })

//     if (!storeUser) {
//       return new NextResponse("Unauthorized", { status: 403 })
//     }

//     // Only admin and owner can view members
//     if (storeUser.role !== "ADMIN" && storeUser.role !== "OWNER") {
//       return new NextResponse("Unauthorized", { status: 403 })
//     }

//     const members = await db.storeUser.findMany({
//       where: {
//         storeId: params.storeId,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     })

//     return NextResponse.json(members)
//   } catch (error) {
//     console.log("[MEMBERS_GET]", error)
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }

import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// GET all members of a store
export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    // Check if the user has access to this store
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        OR: [
          { userId },
          {
            members: {
              some: {
                user: {
                  clerkId: userId,
                },
              },
            },
          },
        ],
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Get all members for this store
    const members = await prismadb.member.findMany({
      where: {
        storeId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true,
          },
        },
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.log("[MEMBERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST to add a new member to a store
export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params
    const body = await req.json()
    const { email, role } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    if (!role) {
      return new NextResponse("Role is required", { status: 400 })
    }

    // Check if the user has permission to add members
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        OR: [
          { userId },
          {
            members: {
              some: {
                user: {
                  clerkId: userId,
                },
                role: "owner",
              },
            },
          },
        ],
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Find the user by email
    const user = await prismadb.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if the user is already a member
    const existingMember = await prismadb.member.findFirst({
      where: {
        storeId,
        userId: user.id,
      },
    })

    if (existingMember) {
      return new NextResponse("User is already a member of this store", { status: 400 })
    }

    // Add the user as a member
    const member = await prismadb.member.create({
      data: {
        storeId,
        userId: user.id,
        role,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.log("[MEMBERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
