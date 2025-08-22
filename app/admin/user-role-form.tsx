"use client"

import { useState } from "react"
import type { User } from "@clerk/clerk-sdk-node"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { updateUserRole } from "./actions"
import { toast } from "@/hooks/use-toast"

interface UserRoleFormProps {
  user: User
}

export function UserRoleForm({ user }: UserRoleFormProps) {
  const currentRole = (user.publicMetadata.role as string) || "user"
  const [role, setRole] = useState(currentRole)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateRole = async () => {
    if (role === currentRole) return

    try {
      setIsLoading(true)
      await updateUserRole(user.id, role)
      toast({
        title: "Role updated",
        description: `User role has been updated to ${role}`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="store_admin">Store Admin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleUpdateRole} disabled={role === currentRole || isLoading} className="w-full">
        {isLoading ? "Updating..." : "Update Role"}
      </Button>
    </div>
  )
}
