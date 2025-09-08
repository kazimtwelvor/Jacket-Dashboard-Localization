"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { updateUserRole } from "./actions"
import { toast } from "@/components/ui/use-toast"

interface SerializedUser {
  id: string
  firstName: string
  lastName: string
  imageUrl: string
  emailAddress: string
  createdAt: string
  role: string
}

interface AdminUserCardProps {
  user: SerializedUser
}

export function AdminUserCard({ user }: AdminUserCardProps) {
  const [role, setRole] = useState(user.role || "user")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateRole = async () => {
    try {
      setIsLoading(true)
      await updateUserRole(user.id, role)
      toast({
        title: "Role updated",
        description: `${user.firstName} ${user.lastName}'s role has been updated to ${role}`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "There was an error updating the role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.imageUrl} alt={user.firstName || "User"} />
            <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription className="text-xs truncate max-w-[200px]">{user.emailAddress}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-xs truncate max-w-[150px]">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Role:</span>
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 flex flex-col gap-2 p-2">
        <div className="w-full">
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
        </div>
        <div className="flex gap-2 w-full">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleUpdateRole}
            disabled={isLoading || role === user.role}
          >
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
