"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export type ContactFormColumn = {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: string
  createdTime?: string
}

export const contactColumns: ColumnDef<ContactFormColumn>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "PENDING" ? "secondary" : row.original.status === "IN_PROGRESS" ? "default" : row.original.status === "RESOLVED" ? "outline" : "destructive"}>
        {row.original.status?.replace("_", " ") || "PENDING"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleDateString()
    },
  },
  {
    id: "createdTime",
    header: "Time",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleTimeString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} type="contact" />
  },
]