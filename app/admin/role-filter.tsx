"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Check, Filter, Shield, ShieldAlert, User, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function RoleFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current role filter
  const role = searchParams.get("role")
  const view = searchParams.get("view") || "grid"

  // Create a new search params object and merge with existing
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === "") {
        params.delete(name)
      } else {
        params.set(name, value)
      }

      return params.toString()
    },
    [searchParams],
  )

  // Handle role selection
  const handleRoleSelect = (selectedRole: string) => {
    // If clicking the already selected role, clear the filter
    const newRole = role === selectedRole ? "" : selectedRole
    router.push(`/admin?${createQueryString("role", newRole)}`)
  }

  // Get active filter label and icon
  const getActiveFilterInfo = () => {
    switch (role) {
      case "super_admin":
        return { label: "Super Admins", icon: <ShieldAlert className="h-3 w-3 mr-1" /> }
      case "admin":
        return { label: "Admins", icon: <Shield className="h-3 w-3 mr-1" /> }
      case "moderator":
        return { label: "Moderators", icon: <UserCog className="h-3 w-3 mr-1" /> }
      case "user":
        return { label: "Regular Users", icon: <User className="h-3 w-3 mr-1" /> }
      default:
        return { label: "All Roles", icon: null }
    }
  }

  const activeFilter = getActiveFilterInfo()

  return (
    <div className="flex items-center gap-2">
      {role && (
        <Badge
          variant="outline"
          className={`flex gap-1 items-center ${
            role === "super_admin"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              : role === "admin"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                : role === "moderator"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {activeFilter.icon}
          {activeFilter.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-white/20"
            onClick={() => router.push(`/admin?${createQueryString("role", "")}`)}
          >
            <span className="sr-only">Clear filter</span>
            <span aria-hidden="true">×</span>
          </Button>
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 bg-white dark:bg-slate-900 shadow-sm">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={role === "super_admin"}
            onCheckedChange={() => handleRoleSelect("super_admin")}
            className="gap-2"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
            Super Admins
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={role === "admin"}
            onCheckedChange={() => handleRoleSelect("admin")}
            className="gap-2"
          >
            <Shield className="h-3.5 w-3.5 text-purple-500" />
            Admins
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={role === "moderator"}
            onCheckedChange={() => handleRoleSelect("moderator")}
            className="gap-2"
          >
            <UserCog className="h-3.5 w-3.5 text-blue-500" />
            Moderators
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={role === "user"}
            onCheckedChange={() => handleRoleSelect("user")}
            className="gap-2"
          >
            <User className="h-3.5 w-3.5 text-gray-500" />
            Regular Users
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={!role}
            onCheckedChange={() => router.push(`/admin?${createQueryString("role", "")}`)}
            className="font-medium"
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            Show All
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
