"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { ColorDisplay } from "@/components/ui/color-display"

export type ColorColumn = {
  id: string
  name: string
  value: string
  value2?: string
  productCount?: number
  createdAt: string
}

export const columns: ColumnDef<ColorColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const colorValue = row.original?.value || "#CCCCCC"
      const colorValue2 = row.original?.value2
      
      return (
        <div className="flex items-center gap-x-2">
          <div className="font-mono text-sm">
            {colorValue2 ? (
              <div>
                <div>{colorValue}</div>
                <div>{colorValue2}</div>
              </div>
            ) : (
              colorValue
            )}
          </div>
          <ColorDisplay 
            color1={colorValue} 
            color2={colorValue2}
            size="md"
          />
        </div>
      )
    },
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
