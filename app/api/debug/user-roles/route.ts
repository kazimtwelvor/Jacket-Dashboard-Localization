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

    if (!prismadb.userRole) {
      return NextResponse.json({
        userId,
        roles: [],
        isSuperAdmin: false,
        error: "Database schema issue",
      })
    }

    try {
      const userRoles = await prismadb.userRole.findMany({
        where: {
          userId,
        },
      })

      const superAdminRole = userRoles.find((role) => role.role === Role.SUPER_ADMIN)
      const isSuperAdmin = !!superAdminRole
      const adminRole = userRoles.find((role) => role.role === Role.ADMIN)
      const isAdmin = !!adminRole

      return NextResponse.json({
        userId,
        roles: userRoles,
        isSuperAdmin,
        isAdmin,
      })
    } catch (dbError) {
      return NextResponse.json({
        userId,
        roles: [],
        isSuperAdmin: false,
        isAdmin: false,
        error: "Database query error",
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
