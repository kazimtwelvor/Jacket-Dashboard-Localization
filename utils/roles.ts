import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/clerk-sdk-node"

// Check if the current user has a specific role
export async function checkRole(requiredRole: string): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return false
    }

    const user = await clerkClient.users.getUser(userId)
    const userRole = user.publicMetadata.role as string

    // Check if the user has the required role
    // For admin check, also allow super_admin
    if (requiredRole === "admin") {
      return userRole === "admin" || userRole === "super_admin"
    }

    return userRole === requiredRole
  } catch (error) {
    console.error("Error checking role:", error)
    return false
  }
}

// Get the current user's role
export async function getUserRole(): Promise<string | null> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const user = await clerkClient.users.getUser(userId)
    return (user.publicMetadata.role as string) || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}
