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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const invitationColumns: ColumnDef<any>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return <Badge variant="outline">{role}</Badge>
    },
  },
  {
    accessorKey: "expires",
    header: "Expires",
    cell: ({ row }) => {
      const dateValue = row.getValue("expires")

      if (!dateValue) {
        return <div>N/A</div>
      }

      try {
        const date = new Date(dateValue)
        if (isNaN(date.getTime())) {
          return <div>Invalid date</div>
        }
        return <div>{format(date, "MMM d, yyyy")}</div>
      } catch (error) {
        return <div>Invalid date</div>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invitationId = row.original.id
      const storeId = row.original.storeId

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
                fetch(`/api/${storeId}/invitations/${invitationId}/resend`, {
                  method: "POST",
                })
                  .then((res) => {
                    if (res.ok) {
                      window.location.reload()
                    }
                  })
                  .catch((err) => {
                    console.error(err)
                  })
              }}
            >
              Resend
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (confirm("Are you sure you want to cancel this invitation?")) {
                  fetch(`/api/${storeId}/invitations/${invitationId}`, {
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
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
