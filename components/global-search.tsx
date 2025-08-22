"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const params = useParams()

  const routes = [
    {
      label: "Overview",
      route: `/${params.storeId}`,
    },
    {
      label: "Billboards",
      route: `/${params.storeId}/billboards`,
    },
    {
      label: "Categories",
      route: `/${params.storeId}/categories`,
    },
    {
      label: "Sizes",
      route: `/${params.storeId}/sizes`,
    },
    {
      label: "Colors",
      route: `/${params.storeId}/colors`,
    },
    {
      label: "Products",
      route: `/${params.storeId}/products`,
    },
    {
      label: "Orders",
      route: `/${params.storeId}/orders`,
    },
    {
      label: "Pages",
      route: `/${params.storeId}/pages`,
    },
    {
      label: "Settings",
      route: `/${params.storeId}/settings`,
    },
  ]

  const onSelect = (route: string) => {
    router.push(route)
    setOpen(false)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-x-2">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline-block">Search</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels and chats..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {routes.map((route) => (
              <CommandItem key={route.route} onSelect={() => onSelect(route.route)}>
                {route.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
