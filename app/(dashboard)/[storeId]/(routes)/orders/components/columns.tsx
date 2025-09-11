"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export type OrderColumn = {
  id: string
  customerName: string
  customerEmail: string
  phone: string
  total: string
  isPaid: boolean
  status: string
  paymentStatus: string
  // fulfillmentStatus: string
  createdAt: string
}

export const columns: ColumnDef<OrderColumn>[] = [

  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.customerName || "Guest Customer"}
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.original.total}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status

      let badgeVariant: "default" | "outline" | "secondary" | "destructive" = "default"

      if (status === "PENDING") badgeVariant = "secondary"
      if (status === "PROCESSING") badgeVariant = "default"
      if (status === "SHIPPED") badgeVariant = "default"
      if (status === "DELIVERED") badgeVariant = "default"
      if (status === "CANCELLED") badgeVariant = "destructive"
      if (status === "REFUNDED") badgeVariant = "outline"

      return <Badge variant={badgeVariant}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus

      let badgeVariant: "default" | "outline" | "secondary" | "destructive" = "default"

      if (paymentStatus === "pending") badgeVariant = "secondary"
      if (paymentStatus === "completed") badgeVariant = "default"
      if (paymentStatus === "failed") badgeVariant = "destructive"
      if (paymentStatus === "refunded") badgeVariant = "outline"

      return <Badge variant={badgeVariant}>{paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</Badge>
    },
  },
  {
    // accessorKey: "fulfillmentStatus",
    header: "Fulfillment",
    cell: ({ row }) => {
      // const fulfillmentStatus = row.original.fulfillmentStatus

      let badgeVariant: "default" | "outline" | "secondary" | "destructive" = "default"

      // if (fulfillmentStatus === "pending") badgeVariant = "secondary"
      // if (fulfillmentStatus === "processing") badgeVariant = "secondary"
      // if (fulfillmentStatus === "shipped") badgeVariant = "default"
      // if (fulfillmentStatus === "delivered") badgeVariant = "default"

      // return (
      //   <Badge variant={badgeVariant}>{fulfillmentStatus.charAt(0).toUpperCase() + fulfillmentStatus.slice(1)}</Badge>
      // )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
