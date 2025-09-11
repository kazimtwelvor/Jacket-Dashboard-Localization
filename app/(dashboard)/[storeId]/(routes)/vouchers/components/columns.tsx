"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export type VoucherColumn = {
  id: string
  code: string
  type: string
  value: string
  usedCount: number
  usageLimit: number | null
  isActive: boolean
  validUntil: string | null
  createdAt: string
}

export const columns: ColumnDef<VoucherColumn>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const typeLabels = {
        PERCENTAGE: "Percentage",
        FIXED: "Fixed Amount",
        BUY_X_GET_Y: "Buy X Get Y"
      }
      return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels]}</Badge>
    }
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "usage",
    header: "Usage",
    cell: ({ row }) => {
      const usedCount = row.original.usedCount
      const usageLimit = row.original.usageLimit
      return (
        <span>
          {usedCount}{usageLimit ? ` / ${usageLimit}` : ""}
        </span>
      )
    }
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "validUntil",
    header: "Valid Until",
    cell: ({ row }) => {
      const validUntil = row.getValue("validUntil") as string | null
      return validUntil ? new Date(validUntil).toLocaleDateString() : "No expiry"
    }
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]