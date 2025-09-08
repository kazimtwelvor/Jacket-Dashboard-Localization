"use server"

import { clerkClient } from "@clerk/clerk-sdk-node"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: string) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      throw new Error("Not authenticated")
    }

    const currentUser = await clerkClient.users.getUser(currentUserId)
    const currentUserRole = currentUser.publicMetadata.role as string

    if (currentUserRole !== "admin" && currentUserRole !== "super_admin") {
      throw new Error("Not authorized to update user roles")
    }

    if (role === "admin" && currentUserRole !== "super_admin") {
      throw new Error("Only super admins can assign admin roles")
    }

    const targetUser = await clerkClient.users.getUser(userId)
    if (targetUser.publicMetadata.role === "super_admin" && currentUserRole !== "super_admin") {
      throw new Error("Cannot modify a super admin's role")
    }

    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        role,
      },
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    throw error
  }
}
