import type React from "react"
import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/clerk-sdk-node"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authorized
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const user = await clerkClient.users.getUser(userId)
    const userRole = user.publicMetadata.role as string


    // Allow both admin and super_admin roles
    if (userRole !== "admin" && userRole !== "super_admin") {
      redirect("/")
    }
  } catch (error) {
    redirect("/")
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, roles, and system settings</p>
      </div>
      {children}
    </div>
  )
}
