"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"

type RoleGateProps = {
  children: React.ReactNode
  allowedRoles: string[]
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { isLoaded, userId, sessionClaims } = useAuth()
  const [canAccess, setCanAccess] = useState(false)

  useEffect(() => {
    if (!isLoaded || !userId) {
      setCanAccess(false)
      return
    }

    // Get user role from session claims
    const userRole = sessionClaims?.metadata?.role as string | undefined

    // Check if user has an allowed role
    if (userRole && allowedRoles.includes(userRole)) {
      setCanAccess(true)
    } else {
      setCanAccess(false)
    }
  }, [isLoaded, userId, sessionClaims, allowedRoles])

  // Don't render anything while loading
  if (!isLoaded) return null

  // Only render children if user has access
  return canAccess ? <>{children}</> : null
}
