
import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

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
    return new NextResponse("Internal error", { status: 500 })
  }
}

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

    const user = await prismadb.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const existingMember = await prismadb.member.findFirst({
      where: {
        storeId,
        userId: user.id,
      },
    })

    if (existingMember) {
      return new NextResponse("User is already a member of this store", { status: 400 })
    }

    const member = await prismadb.member.create({
      data: {
        storeId,
        userId: user.id,
        role,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
