import { type NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { checkRole } from "@/utils/roles"

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkRole("admin")

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized. Only admins can remove roles." }, { status: 403 })
    }

    const formData = await req.formData()
    const userId = formData.get("id") as string

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

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
