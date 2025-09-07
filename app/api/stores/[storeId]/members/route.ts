import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { checkRole } from "@/utils/roles"
import { clerkClient } from "@clerk/nextjs/server"

// GET all members of a store
export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { storeId } = params

    // Check if user is a member of the store or an admin
    const isAdmin = await checkRole("admin")
    const isMember = await prismadb.storeMember.findFirst({
      where: {
        storeId,
        userId,
      },
    })

    if (!isAdmin && !isMember) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Get all members of the store
    const members = await prismadb.storeMember.findMany({
      where: {
        storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get user details from Clerk for each member
    const client = await clerkClient()
    const userIds = members.map((member) => member.userId)
    const users = await client.users.getUserList({ userId: userIds })

    // Combine member data with user data
    const membersWithUserData = members.map((member) => {
      const user = users.find((u) => u.id === member.userId)
      return {
        ...member,
        user: user
          ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
              email: user.emailAddresses[0]?.emailAddress,
            }
          : null,
      }
    })

    return NextResponse.json(membersWithUserData)
  } catch (error) {
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
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    if (!role) {
      return new NextResponse("Role is required", { status: 400 })
    }

    // Check if user is a manager of the store or an admin
    const isAdmin = await checkRole("admin")
    const isManager = await prismadb.storeMember.findFirst({
      where: {
        storeId,
        userId,
        role: "manager",
      },
    })

    if (!isAdmin && !isManager) {
      return new NextResponse("Only store managers or admins can add members", { status: 403 })
    }

    // Find the user by email
    const client = await clerkClient()
    const users = await client.users.getUserList({
      emailAddress: [email],
    })

    if (users.length === 0) {
      // User not found, create an invitation
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expires = new Date()
      expires.setDate(expires.getDate() + 7) // Expires in 7 days

      const invitation = await prismadb.invitation.create({
        data: {
          storeId,
          email,
          role,
          token,
          expires,
        },
      })

      // TODO: Send invitation email

      return NextResponse.json({ invitation, status: "invited" })
    }

    const userToAdd = users[0]

    // Check if user is already a member
    const existingMember = await prismadb.storeMember.findFirst({
      where: {
        storeId,
        userId: userToAdd.id,
      },
    })

    if (existingMember) {
      return new NextResponse("User is already a member of this store", { status: 400 })
    }

    // Add user as a member
    const member = await prismadb.storeMember.create({
      data: {
        storeId,
        userId: userToAdd.id,
        role,
      },
    })

    return NextResponse.json({ member, status: "added" })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
