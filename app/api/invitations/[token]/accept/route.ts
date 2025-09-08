import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const { userId } = await auth()
    const { token } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!token) {
      return new NextResponse("Token is required", { status: 400 })
    }

    // Find the invitation
    const invitation = await db.invitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return new NextResponse("Invalid invitation token", { status: 404 })
    }

    // Check if invitation has expired
    if (invitation.expires < new Date()) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      })
      return new NextResponse("Invitation has expired", { status: 400 })
    }

    // Check if invitation has already been accepted
    if (invitation.status !== "PENDING") {
      return new NextResponse(`Invitation is ${invitation.status.toLowerCase()}`, { status: 400 })
    }

    // Get the current user
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if the user's email matches the invitation email
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return new NextResponse("This invitation was sent to a different email address", { status: 403 })
    }

    // Check if user is already a member of the store
    const existingStoreUser = await db.storeUser.findFirst({
      where: {
        storeId: invitation.storeId,
        userId,
      },
    })

    if (existingStoreUser) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      })
      return new NextResponse("You are already a member of this store", { status: 400 })
    }

    // Create store user with the role and permissions from the invitation
    await db.storeUser.create({
      data: {
        storeId: invitation.storeId,
        userId,
        role: invitation.role,
        permissions: invitation.permissions,
      },
    })

    // Update invitation status
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
