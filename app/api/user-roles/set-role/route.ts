import { type NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { checkRole } from "@/utils/roles"

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkRole("admin")

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized. Only admins can set roles." }, { status: 403 })
    }

    const formData = await req.formData()
    const userId = formData.get("id") as string
    const role = formData.get("role") as string

    if (!userId || !role) {
      return NextResponse.json({ message: "User ID and role are required" }, { status: 400 })
    }

    const validRoles = ["admin", "moderator", "user"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role. Must be admin, moderator, or user" }, { status: 400 })
    }

    const client = await clerkClient()
    const updatedUser = await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    })

    return NextResponse.json({
      message: "Role updated successfully",
      user: {
        id: updatedUser.id,
        role: updatedUser.publicMetadata.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "Failed to set role" }, { status: 500 })
  }
}
