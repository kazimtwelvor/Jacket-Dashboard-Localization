"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateUserRole } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { Shield, ShieldAlert, User, UserCog, Copy, Check } from "lucide-react"

// Define the user type for better type safety
type SerializedUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  imageUrl: string
  role: string
  createdAt: string
  lastSignInAt?: string
}

export function AdminUserCard({
  user,
  currentUserRole,
}: {
  user: SerializedUser
  currentUserRole: string
}) {
  const [role, setRole] = useState(user.role || "user")
  const [isUpdating, setIsUpdating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Get user initials for avatar fallback
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`

  // Format date
  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  // Handle role change
  const handleRoleChange = async (newRole: string) => {
    setRole(newRole)

    // Only super_admin can set admin roles
    if (newRole === "admin" && currentUserRole !== "super_admin") {
      toast({
        title: "Permission denied",
        description: "Only super admins can assign admin roles",
        variant: "destructive",
      })
      setRole(user.role) // Reset to original role
      return
    }

    // Prevent changing super_admin roles unless you're a super_admin
    if (user.role === "super_admin" && currentUserRole !== "super_admin") {
      toast({
        title: "Permission denied",
        description: "You cannot modify a super admin's role",
        variant: "destructive",
      })
      setRole(user.role) // Reset to original role
      return
    }

    try {
      setIsUpdating(true)
      await updateUserRole(user.id, newRole)
      toast({
        title: "Role updated",
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating the user role",
        variant: "destructive",
      })
      setRole(user.role) // Reset to original role on error
    } finally {
      setIsUpdating(false)
    }
  }

  // Copy user ID to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "User ID has been copied to clipboard",
      duration: 2000,
    })
  }

  // Get role badge color and icon
  const getRoleBadge = () => {
    switch (role) {
      case "super_admin":
        return {
          color: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300",
          icon: <ShieldAlert className="h-3 w-3 mr-1" />,
        }
      case "admin":
        return {
          color: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
          icon: <Shield className="h-3 w-3 mr-1" />,
        }
      case "moderator":
        return {
          color: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
          icon: <UserCog className="h-3 w-3 mr-1" />,
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300",
          icon: <User className="h-3 w-3 mr-1" />,
        }
    }
  }

  const roleBadge = getRoleBadge()

  // Calculate time since joined
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 30) return `${diffInDays} days ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-primary/10 text-primary">{initials || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="text-xs truncate max-w-[180px]">{user.email}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`flex items-center text-xs font-normal ${roleBadge.color}`}>
            {roleBadge.icon}
            {role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-4">
        <div className="grid gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">User ID:</span>
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs bg-muted p-1.5 rounded w-full overflow-x-auto whitespace-nowrap">
                {user.id}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-muted"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="sr-only">Copy ID</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-muted-foreground block">Joined:</span>
              <span className="text-xs font-medium">{formattedDate}</span>
              <span className="text-xs text-muted-foreground ml-1">({getTimeSince(user.createdAt)})</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Last active:</span>
              <span className="text-xs font-medium">
                {user.lastSignInAt ? getTimeSince(user.lastSignInAt) : "Never"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">Change role:</span>
          <div className="flex items-center gap-2">
            <Select value={role} onValueChange={handleRoleChange} disabled={isUpdating}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                {currentUserRole === "super_admin" && (
                  <>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {isUpdating && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
