"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type NewsletterFormColumn = {
  id: string
  name: string
  email: string
  preferences: string
  createdAt: string
  createdTime?: string
}

export const newsletterColumns: ColumnDef<NewsletterFormColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "preferences",
    header: "Preferences",
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
    cell: ({ row }) => <CellAction data={row.original} type="newsletter" />
  },
]