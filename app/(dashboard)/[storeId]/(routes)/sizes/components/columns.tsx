"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type SizeColumn = {
  id: string
  name: string
  value: string
  productCount?: number
  createdAt: string
}

export const columns: ColumnDef<SizeColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
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
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
