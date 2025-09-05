"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import axios from "axios"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"

interface PayPalButtonProps {
  items: any[]
  customerId?: string
  onSuccess?: (orderId: string) => void
  onError?: (error: any) => void
  className?: string
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ items, customerId, onSuccess, onError, className }) => {
  const [clientId, setClientId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const storeId = params.storeId as string

  useEffect(() => {
    const fetchPayPalConfig = async () => {
      try {
        const response = await axios.get(`/api/stores/${storeId}/payment-settings`)
        if (response.data.paypalEnabled && response.data.paypalClientId) {
          setClientId(response.data.paypalClientId)
        } else {
          setError("PayPal is not configured for this store")
        }
      } catch (error) {
        setError("Failed to load PayPal configuration")
      } finally {
        setLoading(false)
      }
    }

    fetchPayPalConfig()
  }, [storeId])

  const createOrder = async () => {
    try {
      const response = await axios.post(`/api/${storeId}/paypal/create-order`, {
        items,
        customerId,
      })
      return response.data.orderId
    } catch (error) {
      toast.error("Failed to create PayPal order")
      if (onError) onError(error)
      throw error
    }
  }

  const onApprove = async (data: { orderID: string }) => {
    try {
      const response = await axios.post(`/api/${storeId}/paypal/capture-order`, {
        orderID: data.orderID,
      })

      if (response.data.success) {
        toast.success("Payment successful!")
        if (onSuccess) onSuccess(response.data.order.id)
        return true
      } else {
        throw new Error("Failed to capture order")
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.")
      if (onError) onError(error)
      return false
    }
  }

  if (loading) {
    return <div className="py-4 text-center">Loading payment options...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className={className}>
      <PayPalScriptProvider
        options={{
          "client-id": clientId,
          currency: "USD",
          intent: "capture",
        }}
      >
        <PayPalButtons
          style={{
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 50,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            toast.error("PayPal error occurred")
            if (onError) onError(err)
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}
