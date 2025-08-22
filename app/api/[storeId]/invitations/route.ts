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

    // Check if user has permission to invite users to this store
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Check if user is already a member of the store
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

    // Check if there's already a pending invitation
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

    // Generate a unique token
    const token = crypto.randomBytes(32).toString("hex")

    // Set expiration date (48 hours from now)
    const expiresDate = new Date()
    expiresDate.setHours(expiresDate.getHours() + 48)

    // Create the invitation
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
    console.log("[INVITATIONS_POST]", error)
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

    // Check if user has permission to view invitations
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Get all pending invitations
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
    console.log("[INVITATIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
