"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

import { type OrderColumn, columns } from "./columns"
import { OrderFilters } from "./order-filters"

interface OrdersClientProps {
  data: any[]
}

export const OrdersClient: React.FC<OrdersClientProps> = ({ data }) => {
  const params = useParams()
  const router = useRouter()
  const [filteredData, setFilteredData] = useState<OrderColumn[]>(formatOrders(data))
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    fulfillmentStatus: "",
  })

  useEffect(() => {
    if (filters.status || filters.paymentStatus || filters.fulfillmentStatus) {
      const filtered = formatOrders(data).filter((order) => {
        return (
          (!filters.status || order.status === filters.status) &&
          (!filters.paymentStatus || order.paymentStatus === filters.paymentStatus) &&
          (!filters.fulfillmentStatus || order.fulfillmentStatus === filters.fulfillmentStatus)
        )
      })
      setFilteredData(filtered)
    } else {
      setFilteredData(formatOrders(data))
    }
  }, [data, filters])

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const handleResetFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      fulfillmentStatus: "",
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Orders (${filteredData.length})`} description="Manage your store orders" />
        <Button onClick={() => router.push(`/${params.storeId}/orders/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <OrderFilters filters={filters} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} />
      <DataTable searchKey="customerName" columns={columns} data={filteredData} />
      <Heading title="API" description="API Calls for Orders" />
      <Separator />
      <ApiList entityName="orders" entityIdName="orderId" />
    </>
  )
}

function formatOrders(orders: any[]): OrderColumn[] {
  return orders.map((item) => ({
    id: item.id,
    customerName: item.customerName || "Guest Customer",
    customerEmail: item.customerEmail || item.user?.email || "No email",
    phone: item.phone || "No phone",
    total:
      typeof item.total === "number"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.total)
        : typeof item.total === "string"
          ? item.total
          : "$0.00",
    isPaid: item.isPaid,
    status: item.status,
    paymentStatus: item.paymentStatus || "pending",
    fulfillmentStatus: item.fulfillmentStatus || "pending",
    createdAt: new Date(item.createdAt).toLocaleDateString(),
  }))
}
