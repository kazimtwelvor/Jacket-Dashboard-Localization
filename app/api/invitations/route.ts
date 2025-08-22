import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { storeId, email, role, permissions } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    // Check if user has permission to invite users to this store
    const storeUser = await db.storeUser.findFirst({
      where: {
        storeId,
        userId,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    })

    if (!storeUser) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Check if user is already a member of the store
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      const existingStoreUser = await db.storeUser.findFirst({
        where: {
          storeId,
          userId: existingUser.id,
        },
      })

      if (existingStoreUser) {
        return new NextResponse("User is already a member of this store", { status: 400 })
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        storeId,
        email,
        status: "PENDING",
      },
    })

    if (existingInvitation) {
      return new NextResponse("An invitation has already been sent to this email", { status: 400 })
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString("hex")

    // Set expiration date (48 hours from now)
    const expires = new Date()
    expires.setHours(expires.getHours() + 48)

    // Create the invitation
    const invitation = await db.invitation.create({
      data: {
        storeId,
        email,
        role: role || "VIEWER",
        permissions: permissions || [],
        token,
        expires,
        status: "PENDING",
      },
    })

    // TODO: Send invitation email

    return NextResponse.json(invitation)
  } catch (error) {
    console.log("[INVITATIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
