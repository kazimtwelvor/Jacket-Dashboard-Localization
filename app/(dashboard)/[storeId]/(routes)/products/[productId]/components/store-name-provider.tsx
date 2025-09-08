"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import axios from "axios"

interface StoreNameContextType {
  storeName: string | null
  isLoading: boolean
  error: Error | null
}

const StoreNameContext = createContext<StoreNameContextType>({
  storeName: null,
  isLoading: true,
  error: null,
})

export const useStoreName = () => useContext(StoreNameContext)

interface StoreNameProviderProps {
  storeId: string
  children: ReactNode
}

export const StoreNameProvider = ({ storeId, children }: StoreNameProviderProps) => {
  const [storeName, setStoreName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`/api/stores/${storeId}/info`)

        if (response.data && response.data.name) {
          setStoreName(response.data.name)
        } else {
          setStoreName(`Store ${storeId.substring(0, 8)}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch store name"))
        setStoreName(`Store ${storeId.substring(0, 8)}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (storeId) {
      fetchStoreName()
    }
  }, [storeId])

  return <StoreNameContext.Provider value={{ storeName, isLoading, error }}>{children}</StoreNameContext.Provider>
}
