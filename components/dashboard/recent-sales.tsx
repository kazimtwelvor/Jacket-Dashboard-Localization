"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  customerName: string
  amount: string
  status: string
  date: string
  email: string
}

interface RecentSalesProps {
  orders: Order[]
  className?: string
}

export function RecentSales({ orders, className }: RecentSalesProps) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No recent orders</div>
  }

  return (
    <div className={className}>
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
              <AvatarFallback>{order.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">{order.email}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-medium">{order.amount}</p>
              <Badge variant={order.status === "Paid" ? "success" : "outline"} className="mt-1">
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
