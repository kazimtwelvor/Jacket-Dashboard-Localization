"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import axios from "axios"

interface StoreAdminCheck {
  isStoreAdmin: boolean
  isLoading: boolean
  userId?: string
}

export const useStoreAdmin = (storeId?: string) => {
  const { user, isLoaded } = useUser()
  const [storeAdminCheck, setStoreAdminCheck] = useState<StoreAdminCheck>({
    isStoreAdmin: false,
    isLoading: true,
  })

  useEffect(() => {
    const checkStoreAdmin = async () => {
      if (!isLoaded || !user || !storeId) {
        setStoreAdminCheck({
          isStoreAdmin: false,
          isLoading: false,
        })
        return
      }

      try {
        const response = await axios.get(`/api/${storeId}/check-store-admin`)
        setStoreAdminCheck({
          isStoreAdmin: response.data.isStoreAdmin,
          isLoading: false,
          userId: response.data.userId,
        })
      } catch (error) {
        console.error("Error checking store admin status:", error)
        setStoreAdminCheck({
          isStoreAdmin: false,
          isLoading: false,
        })
      }
    }

    checkStoreAdmin()
  }, [user, isLoaded, storeId])

  return storeAdminCheck
}
