"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export const useSkuPrefix = (storeId: string) => {
  const [skuPrefix, setSkuPrefix] = useState<string>("SKU")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSkuPrefix = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`/api/stores/${storeId}`)
        setSkuPrefix(response.data.skuPrefix || "SKU")
        setError(null)
      } catch (err) {
        setError("Failed to fetch SKU prefix")
      } finally {
        setIsLoading(false)
      }
    }

    if (storeId) {
      fetchSkuPrefix()
    }
  }, [storeId])

  return { skuPrefix, isLoading, error }
}
