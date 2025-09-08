

import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    const body = await req.json()
    const { token } = body

    if (!userId || !user) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!token) {
      return new NextResponse("Token is required", { status: 400 })
    }

    const invitation = await prismadb.invitation.findUnique({
      where: { token },
      include: {
        store: true,
      },
    })

    if (!invitation) {
      return new NextResponse("Invalid invitation token", { status: 404 })
    }

    if (invitation.expires < new Date()) {
      await prismadb.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      })
      return new NextResponse("Invitation has expired", { status: 400 })
    }

    if (invitation.status !== "PENDING") {
      return new NextResponse(`Invitation is ${invitation.status.toLowerCase()}`, { status: 400 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase()
    if (userEmail !== invitation.email.toLowerCase()) {
      return new NextResponse("This invitation was sent to a different email address", { status: 403 })
    }

    let dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })

    if (!dbUser) {
      dbUser = await prismadb.user.create({
        data: {
          clerkId: userId,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "User",
          email: userEmail || "",
          password: "", // Not used with Clerk
          role: "CUSTOMER", // Default role
        },
      })
    }

    const existingMember = await prismadb.storeUser.findFirst({
      where: {
        storeId: invitation.storeId,
        userId: dbUser.id, // Use the database User ID, not the Clerk ID
      },
    })

    if (existingMember) {
      await prismadb.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      })
      return NextResponse.json({
        success: true,
        message: "You are already a member of this store",
        storeId: invitation.storeId,
      })
    }

    await prismadb.storeUser.create({
      data: {
        storeId: invitation.storeId,
        userId: dbUser.id, // Use the database User ID, not the Clerk ID
        role: invitation.role,
      },
    })

    await prismadb.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    })

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      storeId: invitation.storeId,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
