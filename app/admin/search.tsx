"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(defaultValue)

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

    // Navigate with updated params
    router.push(`/admin?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-sm">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="pl-8 bg-white dark:bg-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" className="shadow-sm">
          Search
        </Button>
      </div>
    </form>
  )
}
