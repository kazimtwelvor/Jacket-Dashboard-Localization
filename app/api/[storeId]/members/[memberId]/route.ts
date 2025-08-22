// import { NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"
// import prismadb from "@/lib/prismadb"

// export async function DELETE(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
//   try {
//     const { userId } = await auth()

//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     if (!params.storeId) {
//       return new NextResponse("Store ID is required", { status: 400 })
//     }

//     if (!params.memberId) {
//       return new NextResponse("Member ID is required", { status: 400 })
//     }

//     // Check if user has permission to remove members
//     const store = await prismadb.store.findFirst({
//       where: {
//         id: params.storeId,
//         userId,
//       },
//     })

//     if (!store) {
//       return new NextResponse("Unauthorized", { status: 403 })
//     }

//     // Get the member to remove
//     const memberToRemove = await prismadb.storeUser.findUnique({
//       where: {
//         id: params.memberId,
//       },
//     })

//     if (!memberToRemove) {
//       return new NextResponse("Member not found", { status: 404 })
//     }

//     // Don't allow removing the store owner
//     if (memberToRemove.userId === store.userId) {
//       return new NextResponse("Cannot remove the store owner", { status: 403 })
//     }

//     // Remove the member
//     await prismadb.storeUser.delete({
//       where: {
//         id: params.memberId,
//       },
//     })

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.log("[MEMBER_DELETE]", error)
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, memberId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!memberId) {
      return new NextResponse("Member ID is required", { status: 400 })
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

    // Get the member
    const member = await prismadb.member.findUnique({
      where: {
        id: memberId,
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

    if (!member || member.storeId !== storeId) {
      return new NextResponse("Member not found", { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.log("[MEMBER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, memberId } = params
    const body = await req.json()
    const { role } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!memberId) {
      return new NextResponse("Member ID is required", { status: 400 })
    }

    if (!role) {
      return new NextResponse("Role is required", { status: 400 })
    }

    // Check if the user has permission to update members
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

    // Update the member
    const member = await prismadb.member.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.log("[MEMBER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, memberId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!memberId) {
      return new NextResponse("Member ID is required", { status: 400 })
    }

    // Check if the user has permission to delete members
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

    // Delete the member
    const member = await prismadb.member.delete({
      where: {
        id: memberId,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.log("[MEMBER_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
