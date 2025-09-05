
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
        // Check if the user has super_admin role in Clerk metadata
        const clerkRole = user.publicMetadata.role as string
        if (clerkRole === "super_admin") {
          setIsSuperAdmin(true)
          setIsLoading(false)
          return
        }

        // If not found in Clerk, check the database as a fallback
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

  // Check if user's email is in the SUPER_USER_EMAILS environment variable
  const isEmailSuperUser =
    user?.emailAddresses?.some((emailObj) => {
      // Get the list of super user emails from the client-side accessible env var
      const superUserEmails = process.env.NEXT_PUBLIC_SUPER_USER_EMAILS?.split(",") || []
      return superUserEmails.includes(emailObj.emailAddress)
    }) || false

  // Return both the async result and the direct checks
  return {
    isSuperAdmin: isSuperAdmin || isEmailSuperUser,
    isLoading,
    directIsSuperAdmin: user?.publicMetadata?.role === "super_admin" || isEmailSuperUser,
  }
}
