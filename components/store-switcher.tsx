"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Check, ChevronsUpDown, PlusCircle, Store } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useStoreModal } from "@/hooks/use-store-modal"
import { Badge } from "@/components/ui/badge"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: {
    id: string
    name: string
    role?: string
  }[]
}

export default function StoreSwitcher({ className, items = [], ...props }: StoreSwitcherProps) {
  const storeModal = useStoreModal()
  const params = useParams()
  const router = useRouter()
  const [memberStores, setMemberStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchMemberStores = async () => {
      try {
        const response = await fetch("/api/member-stores")
        if (response.ok) {
          const data = await response.json()
          setMemberStores(data)
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    fetchMemberStores()
  }, [params?.storeId]) // Re-fetch when store ID changes

  const formattedItems = [
    ...items.map((item) => ({
      id: item.id,
      name: item.name,
      role: "Owner",
    })),
    ...memberStores.filter(
      (store) =>
        !items.some((item) => item.id === store.id),
    ),
  ]

  const currentStore = formattedItems.find((item) => item.id === params.storeId)

  const onStoreSelect = (store: { id: string; name: string }) => {
    setOpen(false)
    router.push(`/${store.id}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn("w-[200px] justify-between", className)}
          {...props}
        >
          <Store className="mr-2 h-4 w-4" />
          {loading ? "Loading..." : currentStore?.name || "Select store"}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search store..." />
            <CommandEmpty>No store found.</CommandEmpty>
            {items.length > 0 && (
              <CommandGroup heading="Your stores">
                {items.map((store) => (
                  <CommandItem key={store.id} onSelect={() => onStoreSelect(store)} className="text-sm">
                    <Store className="mr-2 h-4 w-4" />
                    <span className="flex-1">{store.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      Owner
                    </Badge>
                    {store.id === params.storeId && <Check className="ml-2 h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {memberStores.length > 0 && (
              <CommandGroup heading="Member stores">
                {memberStores
                  .filter((store) => !items.some((item) => item.id === store.id))
                  .map((store) => (
                    <CommandItem key={store.id} onSelect={() => onStoreSelect(store)} className="text-sm">
                      <Store className="mr-2 h-4 w-4" />
                      <span className="flex-1">{store.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {store.role}
                      </Badge>
                      {store.id === params.storeId && <Check className="ml-2 h-4 w-4" />}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  storeModal.onOpen()
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Store
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
