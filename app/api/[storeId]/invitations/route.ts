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
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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
        return NextResponse.json({ error: "User is already a member of this store" }, { status: 400 })
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prismadb.invitation.findFirst({
      where: {
        storeId: storeId,
        email,
        status: "PENDING",
      },
    })

    // If there's a pending invitation, update it with new token and role
    if (existingInvitation) {
      const newToken = crypto.randomBytes(32).toString("hex")
      const newExpiresDate = new Date()
      newExpiresDate.setHours(newExpiresDate.getHours() + 48)

      const updatedInvitation = await prismadb.invitation.update({
        where: { id: existingInvitation.id },
        data: {
          token: newToken,
          role: role,
          expires: newExpiresDate,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        message: "Invitation token regenerated successfully",
        invitation: updatedInvitation,
        token: newToken,
      }, { status: 200 })
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
    console.error("Invitation creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const storeId = params.storeId

    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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
    console.error("Invitation creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
