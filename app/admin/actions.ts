"use server"

import { clerkClient } from "@clerk/clerk-sdk-node"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// Update a user's role
export async function updateUserRole(userId: string, role: string) {
  try {
    // Check if the current user is authorized to update roles
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      throw new Error("Not authenticated")
    }

    // Get the current user to check their role
    const currentUser = await clerkClient.users.getUser(currentUserId)
    const currentUserRole = currentUser.publicMetadata.role as string

    // Only admin and super_admin can update roles
    if (currentUserRole !== "admin" && currentUserRole !== "super_admin") {
      throw new Error("Not authorized to update user roles")
    }

    // Only super_admin can set admin roles
    if (role === "admin" && currentUserRole !== "super_admin") {
      throw new Error("Only super admins can assign admin roles")
    }

    // Only super_admin can update super_admin roles
    const targetUser = await clerkClient.users.getUser(userId)
    if (targetUser.publicMetadata.role === "super_admin" && currentUserRole !== "super_admin") {
      throw new Error("Cannot modify a super admin's role")
    }

    // Update the user's role
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        role,
      },
    })

    // Revalidate the admin page to reflect the changes
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}
