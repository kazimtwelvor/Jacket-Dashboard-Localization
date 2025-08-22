"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { TrashCellAction } from "./components/trash-cell-action"

export type TrashProductColumn = {
  id: string
  name: string
  price: string
  salePrice?: string
  category: string
  size: string
  color: string
  createdAt: string
  deletedAt: string
  isFeatured: boolean
  isArchived: boolean
  isPublished: boolean
  isDeleted: boolean
}

export const trashColumns: ColumnDef<TrashProductColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.original.price
      const salePrice = row.original.salePrice

      if (salePrice) {
        return (
          <div className="flex flex-col">
            <span className="text-green-600 font-medium">{salePrice}</span>
            <span className="text-muted-foreground text-xs line-through">{price}</span>
          </div>
        )
      }

      return <div>{price}</div>
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Size
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-2">
          <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: row.original.color }} />
          {row.original.color}
        </div>
      )
    },
  },
  {
    accessorKey: "deletedAt",
    header: "Deleted At",
  },
  {
    id: "actions",
    cell: ({ row }) => <TrashCellAction data={row.original} />,
  },
]
