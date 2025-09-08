import { type NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { checkRole } from "@/utils/roles"

export async function POST(req: NextRequest) {
  try {
    // Check if the user making the request is an admin
    const isAdmin = await checkRole("admin")

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized. Only admins can remove roles." }, { status: 403 })
    }

    // Get form data
    const formData = await req.formData()
    const userId = formData.get("id") as string

    // Validate inputs
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Update user metadata to remove role
    const client = await clerkClient()
    const updatedUser = await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: null },
    })

    return NextResponse.json({
      message: "Role removed successfully",
      user: {
        id: updatedUser.id,
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "Failed to remove role" }, { status: 500 })
  }
}
