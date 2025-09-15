"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface OrderSummaryProps {
  subtotal: number
  shippingCost: number
  discount: number
  total: number
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ subtotal, shippingCost, tax, discount, total }) => {
  const safeSubtotal = Number(subtotal) || 0
  const safeShippingCost = Number(shippingCost) || 0
  const safeDiscount = Number(discount) || 0
  const safeTotal = Number(total) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${safeSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>${safeShippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            {/* <span>${tax.toFixed(2)}</span> */}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>-${safeDiscount.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${safeTotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
