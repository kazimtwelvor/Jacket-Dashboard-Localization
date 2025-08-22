"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"

interface OrderFiltersProps {
  filters: {
    status: string
    paymentStatus: string
    fulfillmentStatus: string
  }
  onFilterChange: (filterType: string, value: string) => void
  onResetFilters: () => void
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({ filters, onFilterChange, onResetFilters }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Order Status</span>
        <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Payment Status</span>
        <Select value={filters.paymentStatus} onValueChange={(value) => onFilterChange("paymentStatus", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All payment statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Fulfillment Status</span>
        <Select value={filters.fulfillmentStatus} onValueChange={(value) => onFilterChange("fulfillmentStatus", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All fulfillment statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fulfillment statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" size="sm" onClick={onResetFilters} className="ml-auto mt-auto">
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset filters
      </Button>
    </div>
  )
}
