"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { OrdersClient } from "./components/client"
import { useDashboardCountry } from "@/hooks/use-dashboard-country"
import axios from "axios"
import { toast } from "react-hot-toast"

const OrdersPage = () => {
  const params = useParams()
  const { getCountryCode, selectedCountry } = useDashboardCountry()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const countryCode = getCountryCode()
        const url = `/api/${params?.storeId}/orders?cn=${countryCode}&limit=1000`
        
        console.log('[ORDERS_CLIENT] Fetching orders with country:', countryCode)
        
        const response = await axios.get(url)
        const data = response.data.orders || response.data

        // Convert Decimal fields to numbers for client compatibility
        const serializedOrders = data.map((order: any) => ({
          ...order,
          shippingCost: Number(order.shippingCost),
          discount: Number(order.discount),
          total: Number(order.total),
          orderItems: order.orderItems?.map((item: any) => ({
            ...item,
            price: Number(item.price),
            discountAmount: Number(item.discountAmount),
            total: Number(item.total),
            product: item.product ? {
              ...item.product,
              price: Number(item.product.price),
              salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
            } : null
          })) || []
        }))

        setOrders(serializedOrders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        toast.error("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    if (params?.storeId) {
      fetchOrders()
    }
  }, [params?.storeId, selectedCountry?.countryCode])

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          Loading orders...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient data={orders} />
      </div>
    </div>
  )
}

export default OrdersPage
