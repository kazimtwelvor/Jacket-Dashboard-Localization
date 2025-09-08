import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import crypto from "crypto"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const storeId = params.storeId

    const { email, role } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    if (!role) {
      return new NextResponse("Role is required", { status: 400 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const existingUser = await prismadb.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      const existingMember = await prismadb.storeUser.findFirst({
        where: {
          storeId: storeId,
          userId: existingUser.id,
        },
      })

      if (existingMember) {
        return new NextResponse(JSON.stringify({ message: "User is already a member of this store" }), { status: 400 })
      }
    }

    const existingInvitation = await prismadb.invitation.findFirst({
      where: {
        storeId: storeId,
        email,
        status: "PENDING",
      },
    })

    if (existingInvitation) {
      return new NextResponse(
        JSON.stringify({
          message: "An invitation has already been sent to this email",
          token: existingInvitation.token,
        }),
        { status: 200 },
      )
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresDate = new Date()
    expiresDate.setHours(expiresDate.getHours() + 48)

    const invitation = await prismadb.invitation.create({
      data: {
        storeId: storeId,
        email,
        role,
        token,
        expires: expiresDate,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      ...invitation,
      token, // Include the token in the response
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const storeId = params.storeId

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const invitations = await prismadb.invitation.findMany({
      where: {
        storeId: storeId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
