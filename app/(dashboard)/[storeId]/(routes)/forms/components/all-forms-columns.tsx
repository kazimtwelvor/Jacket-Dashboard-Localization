"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export type AllFormsColumn = {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email: string
  subject?: string
  message?: string
  preferences?: string
  status?: string
  createdAt: string
  createdTime?: string
  type: "contact" | "newsletter"
}

export const allFormsColumns: ColumnDef<AllFormsColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      if (row.original.type === "contact") {
        return `${row.original.firstName || ""} ${row.original.lastName || ""}`.trim() || "-"
      }
      return row.original.name || "-"
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      if (row.original.type === "contact") {
        return (
          <Badge variant={row.original.status === "PENDING" ? "secondary" : row.original.status === "IN_PROGRESS" ? "default" : row.original.status === "RESOLVED" ? "outline" : "destructive"}>
            {row.original.status?.replace("_", " ") || "PENDING"}
          </Badge>
        )
      }
      return <Badge variant="outline">Active</Badge>
    },
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "contact" ? "default" : "secondary"}>
        {row.original.type === "contact" ? "Contact" : "Newsletter"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} type={row.original.type} />
  },
]