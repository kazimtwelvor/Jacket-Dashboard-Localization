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

    const userRole = sessionClaims?.metadata?.role as string | undefined

    if (userRole && allowedRoles.includes(userRole)) {
      setCanAccess(true)
    } else {
      setCanAccess(false)
    }
  }, [isLoaded, userId, sessionClaims, allowedRoles])

  if (!isLoaded) return null
  return canAccess ? <>{children}</> : null
}
