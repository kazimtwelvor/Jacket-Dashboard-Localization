"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type CategoryColumn = {
  id: string
  name: string
  billboardLabel?: string | null
  billboard?: { label: string; id: string } | null
  billboardId?: string | null
  createdAt: string
  updatedAt?: string
  isActive?: boolean
  imageUrl?: string | null
  productCount?: number
  products?: any[]
  description?: string | null
  slug?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  featuredProducts?: {
    id: string
    name: string
    price: string
    image: string | null
  }[]
}

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => {
      const count = row.original?.productCount || 0
      return (
        <div className="text-start">
          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium bg-primary/10 text-primary rounded-full">
            {count}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // Defensive check for row.original
      if (!row || !row.original) {
        return null
      }
      return <CellAction data={row.original} />
    },
  },
]
