"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { VouchersClient } from "./components/client"
import { VoucherColumn } from "./components/columns"
import { useDashboardCountry } from "@/hooks/use-dashboard-country"
import axios from "axios"
import { toast } from "react-hot-toast"

const VouchersPage = () => {
  const params = useParams()
  const { getCountryCode, selectedCountry } = useDashboardCountry()
  const [vouchers, setVouchers] = useState<VoucherColumn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true)
        const countryCode = getCountryCode()
        const url = `/api/${params?.storeId}/vouchers?cn=${countryCode}`
        
        console.log('[VOUCHERS_CLIENT] Fetching vouchers with country:', countryCode)
        
        const response = await axios.get(url)
        const data = response.data

        const formattedVouchers: VoucherColumn[] = data.map((item: any) => ({
          id: item.id,
          code: item.code,
          type: item.type,
          value: item.type === "PERCENTAGE" ? `${item.value}%` : 
                 item.type === "FIXED" ? `$${item.value}` :
                 `Buy ${item.buyQuantity} Get ${item.getQuantity}`,
          usedCount: item.usedCount,
          usageLimit: item.usageLimit,
          isActive: item.isActive,
          validUntil: item.validUntil ? format(new Date(item.validUntil), 'MMMM do, yyyy') : null,
          createdAt: format(new Date(item.createdAt), 'MMMM do, yyyy'),
        }))

        setVouchers(formattedVouchers)
      } catch (error) {
        console.error('Failed to fetch vouchers:', error)
        toast.error("Failed to load vouchers")
      } finally {
        setLoading(false)
      }
    }

    if (params?.storeId) {
      fetchVouchers()
    }
  }, [params?.storeId, selectedCountry?.countryCode])

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          Loading vouchers...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VouchersClient data={vouchers} />
      </div>
    </div>
  )
}

export default VouchersPage