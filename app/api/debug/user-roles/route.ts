import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { Role } from "@/types/permissions"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the userRole model exists in prismadb
    if (!prismadb.userRole) {
      console.error("userRole model not found in prismadb")
      return NextResponse.json({
        userId,
        roles: [],
        isSuperAdmin: false,
        error: "Database schema issue",
      })
    }

    try {
      // Get all user roles for this user
      const userRoles = await prismadb.userRole.findMany({
        where: {
          userId,
        },
      })

      // Check if user is a super admin in any store
      const superAdminRole = userRoles.find((role) => role.role === Role.SUPER_ADMIN)
      const isSuperAdmin = !!superAdminRole

      // Check if user is an admin in any store
      const adminRole = userRoles.find((role) => role.role === Role.ADMIN)
      const isAdmin = !!adminRole

      return NextResponse.json({
        userId,
        roles: userRoles,
        isSuperAdmin,
        isAdmin,
      })
    } catch (dbError) {
      console.error("Database query error:", dbError)
      return NextResponse.json({
        userId,
        roles: [],
        isSuperAdmin: false,
        isAdmin: false,
        error: "Database query error",
      })
    }
  } catch (error) {
    console.error("[USER_ROLES_GET]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
