"use client"
import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"
export type CategoryPageColumn = {
  id: string
  name: string
  slug: string
  description: string
  status: string
  isPublished: boolean
  isBest: boolean
  createdAt: string
}

export const columns: ColumnDef<CategoryPageColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description || ""
      return <div className="truncate max-w-[200px]">{description}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || (row.original.isPublished ? "PUBLISHED" : "DRAFT")
      
      return (
        <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
          {status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "isBest",
    header: "Best",
    cell: ({ row }) => {
      const isBest = row.original.isBest
      
      return (
        <Badge variant={isBest ? "default" : "outline"}>
          {isBest ? "Best" : "Regular"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
]