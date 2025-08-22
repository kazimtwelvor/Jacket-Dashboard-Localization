"use client"

import type React from "react"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchUsers() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams)

    // Set or remove search param
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }

    // Keep the tab param if it exists
    const tab = searchParams.get("tab")
    if (tab) {
      params.set("tab", tab)
    }

    // Navigate with updated params
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </div>
    </form>
  )
}
