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
  productCount: number
  createdAt: string
}

export const columns: ColumnDef<CategoryPageColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
  },
  {
    accessorKey: "slug",
    header: "Slug",
    enableSorting: true,
  },
  {
    accessorKey: "productCount",
    header: "Product Count",
    enableSorting: true,
    cell: ({ row }) => {
      const count = row.original.productCount
      if (count === null) {
        return (
          <Badge variant="secondary" className="font-medium">
            Click "Load Product Counts" to see
          </Badge>
        )
      }
      return (
        <Badge variant="outline" className="font-medium">
          {count} products
        </Badge>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
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
    enableSorting: true,
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
    enableSorting: true,
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString()
    }
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => <CellAction data={row.original} />
  }
]