"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { RoleSelector } from "./role-selector"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      const image = row.getValue("image") as string
      const name = row.getValue("name") as string
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)

      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const isOwner = row.original.isOwner
      const isCurrentUser = row.original.isCurrentUser
      const memberId = row.original.id
      const storeId = row.original.storeId
      const currentRole = row.getValue("role") as string

      if (isOwner) {
        return <Badge>Owner</Badge>
      }

      return <RoleSelector memberId={memberId} storeId={storeId} currentRole={currentRole} disabled={isCurrentUser} />
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div>{format(new Date(date), "MMM d, yyyy")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isOwner = row.original.isOwner
      const isCurrentUser = row.original.isCurrentUser
      const memberId = row.original.id
      const storeId = row.original.storeId

      if (isOwner || isCurrentUser) {
        return null
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                if (confirm("Are you sure you want to remove this member?")) {
                  fetch(`/api/${storeId}/members/${memberId}`, {
                    method: "DELETE",
                  })
                    .then((res) => {
                      if (res.ok) {
                        window.location.reload()
                      }
                    })
                    .catch((err) => {
                      console.error(err)
                    })
                }
              }}
              className="text-red-600 focus:text-red-600"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
