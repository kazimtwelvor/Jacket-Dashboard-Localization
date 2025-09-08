
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import axios from "axios"

export const useSuperAdmin = () => {
  const { user, isLoaded } = useUser()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false)
        return
      }

      try {
        const clerkRole = user.publicMetadata.role as string
        if (clerkRole === "super_admin") {
          setIsSuperAdmin(true)
          setIsLoading(false)
          return
        }

        const response = await axios.get("/api/check-admin")
        setIsSuperAdmin(response.data.isSuperAdmin)
      } catch (error) {
        setIsSuperAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSuperAdmin()
  }, [user, isLoaded])

  const isEmailSuperUser =
    user?.emailAddresses?.some((emailObj) => {
      const superUserEmails = process.env.NEXT_PUBLIC_SUPER_USER_EMAILS?.split(",") || []
      return superUserEmails.includes(emailObj.emailAddress)
    }) || false

  return {
    isSuperAdmin: isSuperAdmin || isEmailSuperUser,
    isLoading,
    directIsSuperAdmin: user?.publicMetadata?.role === "super_admin" || isEmailSuperUser,
  }
}
