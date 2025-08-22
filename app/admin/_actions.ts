"use server"

import { checkRole } from "@/utils/roles"
import { clerkClient } from "@clerk/nextjs/server"
import type { Roles } from "@/types/globals"
import { revalidatePath } from "next/cache"

export async function setRole(formData: FormData) {
  // Check that the user trying to set the role is an admin
  const isAdmin = await checkRole("admin")
  if (!isAdmin) {
    return { success: false, message: "Not Authorized" }
  }

  try {
    const userId = formData.get("id") as string
    const role = formData.get("role") as Roles

    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    })

    revalidatePath("/admin")
    return { success: true, message: `Role updated to ${role}` }
  } catch (err) {
    console.error("Error setting role:", err)
    return { success: false, message: "Failed to update role" }
  }
}

export async function removeRole(formData: FormData) {
  // Check that the user trying to remove the role is an admin
  const isAdmin = await checkRole("admin")
  if (!isAdmin) {
    return { success: false, message: "Not Authorized" }
  }

  try {
    const userId = formData.get("id") as string

    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: null },
    })

    revalidatePath("/admin")
    return { success: true, message: "Role removed successfully" }
  } catch (err) {
    console.error("Error removing role:", err)
    return { success: false, message: "Failed to remove role" }
  }
}
