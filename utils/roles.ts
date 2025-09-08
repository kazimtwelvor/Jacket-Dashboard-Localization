import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/clerk-sdk-node"

export async function checkRole(requiredRole: string): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return false
    }

    const user = await clerkClient.users.getUser(userId)
    const userRole = user.publicMetadata.role as string

    if (requiredRole === "admin") {
      return userRole === "admin" || userRole === "super_admin"
    }

    return userRole === requiredRole
  } catch (error) {
    return false
  }
}

export async function getUserRole(): Promise<string | null> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const user = await clerkClient.users.getUser(userId)
    return (user.publicMetadata.role as string) || null
  } catch (error) {
    return null
  }
}
