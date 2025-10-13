"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useRouter } from "next/navigation"
import { useStoreModal } from "@/hooks/use-store-modal"
import { DashboardCountrySelector } from "./dashboard-country-selector"

interface TopbarProps {
  stores: Record<string, any>[]
}

export default function Topbar({ stores = [] }: TopbarProps) {
  const params = useParams()
  const router = useRouter()
  const storeModal = useStoreModal()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 left-0 h-20 z-40 border-b border-[#2a3a56] bg-gradient-to-r from-[#1a2942] to-[#121f34] flex flex-col items-center justify-center px-4 shadow-md transition-all duration-300 ease-in-out md:h-16 md:left-[var(--sidebar-width,70px)] md:flex-row md:justify-between">
      {/* Empty div for spacing on desktop */}
      <div className="hidden md:block w-[100px]" />

      {/* Logo Container - Centered */}
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center justify-center relative py-1">
          <div className="relative">
            {/* Glow effect behind the text */}
            <div className="absolute inset-0 blur-md bg-gradient-to-r from-[#4cc9f0]/30 via-[#4361ee]/30 to-[#7209b7]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Main title with multiple gradients and effects */}
            <h1 className="relative text-2xl md:text-3xl font-black tracking-wider">
              {/* Background gradient */}
              <span className="absolute inset-0 bg-gradient-to-r from-[#4cc9f0] via-[#4361ee] to-[#7209b7] bg-clip-text text-transparent blur-sm opacity-50">
                FINEYST
              </span>

              {/* Main text with gradient */}
              <span className="relative bg-gradient-to-r from-[#60d8ff] via-[#4361ee] to-[#8b2cc4] bg-clip-text text-transparent">
                FINEYST
              </span>

              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-clip-text text-transparent group-hover:opacity-50 transition-opacity duration-500">
                FINEYST
              </span>
            </h1>
          </div>

          {/* Animated gradient line */}
          <div className="relative h-0.5 w-full mt-1">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4cc9f0] via-[#4361ee] to-[#7209b7] rounded-full opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-shine"></div>
          </div>

          {/* Store Name - Only on mobile */}
          <div className="md:hidden mt-1">
            <p className="text-[#8a9cb8] text-sm font-medium">
              {stores.find((store) => store.id === params?.storeId)?.name || "Select a store"}
            </p>
          </div>
        </div>
      </div>

      {/* User Button and Theme Toggle - Right aligned on desktop */}
      <div className="fixed right-4 top-4 md:relative md:right-0 md:top-0 md:flex md:justify-end md:items-center md:gap-2">
        <DashboardCountrySelector />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-[#243552] border border-[#3a4d6b]"
          onClick={() => router.push("/sign-in")}
        >
          <User className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  )
}
