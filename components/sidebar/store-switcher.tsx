"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Check, ChevronRight, PlusCircle, StoreIcon } from "lucide-react"
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

interface StoreSwitcherProps {
  className?: string
  items: {
    id: string
    name: string
    role?: string
  }[]
}

export default function StoreSwitcher({ className, items = [] }: StoreSwitcherProps) {
  const storeModal = useStoreModal()
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Get current store ID from params
  const currentStoreId = params?.storeId ? String(params.storeId) : null

  // Find current store from items
  const currentStore = items.find((item) => item.id === currentStoreId)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Separate owned and member stores
  const ownedStores = items.filter((store) => !store.role || store.role === "Owner")
  const memberStores = items.filter((store) => store.role && store.role !== "Owner")

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
          className={cn(
            "w-full justify-between bg-[#1e2a45] text-white border-[#1e2a45] hover:bg-[#2a3a5a] hover:text-white hover:border-[#2a3a5a]",
            className,
          )}
        >
          <span className="font-medium">Store</span>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search store..." />
            <CommandEmpty>No store found.</CommandEmpty>

            {ownedStores.length > 0 && (
              <CommandGroup heading="Your stores">
                {ownedStores.map((store) => (
                  <CommandItem key={`owned-${store.id}`} onSelect={() => onStoreSelect(store)} className="text-sm">
                    <StoreIcon className="mr-2 h-4 w-4" />
                    <span className="flex-1">{store.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      Owner
                    </Badge>
                    {store.id === currentStoreId && <Check className="ml-2 h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {memberStores.length > 0 && (
              <CommandGroup heading="Member stores">
                {memberStores.map((store) => (
                  <CommandItem key={`member-${store.id}`} onSelect={() => onStoreSelect(store)} className="text-sm">
                    <StoreIcon className="mr-2 h-4 w-4" />
                    <span className="flex-1">{store.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {store.role}
                    </Badge>
                    {store.id === currentStoreId && <Check className="ml-2 h-4 w-4" />}
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
