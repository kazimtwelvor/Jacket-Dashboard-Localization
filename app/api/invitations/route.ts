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
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    // if (existingUser) {
    //   const existingStoreUser = await db.storeUser.findFirst({
    //     where: {
    //       storeId,
    //       userId: existingUser.id,
    //     },
    //   })

    //   if (existingStoreUser) {
    //     return NextResponse.json({ error: "User is already a member of this store" }, { status: 400 })
    //   }
    // }

    const existingInvitation = await db.invitation.findFirst({
      where: {
        storeId,
        email,
        status: "PENDING",
      },
    })

    if (existingInvitation) {
      const newToken = crypto.randomBytes(32).toString("hex")
      const newExpires = new Date()
      newExpires.setHours(newExpires.getHours() + 48)

      const updatedInvitation = await db.invitation.update({
        where: { id: existingInvitation.id },
        data: {
          token: newToken,
          role: role || "VIEWER",
          permissions: permissions || [],
          expires: newExpires,
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
    const expires = new Date()
    expires.setHours(expires.getHours() + 48)
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


    return NextResponse.json(invitation)
  } catch (error) {
    console.error("Invitation creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
