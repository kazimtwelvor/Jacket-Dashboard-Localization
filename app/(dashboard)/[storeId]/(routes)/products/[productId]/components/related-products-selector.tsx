"use client"

import React, { useState, useEffect } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from "axios"

interface Product {
  id: string
  name: string
  sku: string
  images: Array<{ url: string }>
}

interface RelatedProductsSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  storeId: string
  currentProductId?: string
  disabled?: boolean
}

export const RelatedProductsSelector: React.FC<RelatedProductsSelectorProps> = ({
  value,
  onChange,
  storeId,
  currentProductId,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/${storeId}/products?admin=true&limit=1000`)
        const allProducts = response.data.products || response.data || []
        const filteredProducts = currentProductId 
          ? allProducts.filter((product: Product) => product.id !== currentProductId)
          : allProducts
        setProducts(filteredProducts)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    if (storeId) {
      fetchProducts()
    }
  }, [storeId, currentProductId])

  const selectedProducts = products.filter((product) => value.includes(product.id))

  const handleSelect = (productId: string) => {
    if (value.includes(productId)) {
      onChange(value.filter((id) => id !== productId))
    } else {
      onChange([...value, productId])
    }
  }

  const handleRemove = (productId: string) => {
    onChange(value.filter((id) => id !== productId))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {value.length > 0
              ? `${value.length} product${value.length > 1 ? "s" : ""} selected`
              : "Select related products..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search products..." />
            <CommandEmpty>
              {loading ? "Loading products..." : "No products found."}
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-72">
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => handleSelect(product.id)}
                    className="flex items-center gap-3 p-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(product.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      {product.images?.[0]?.url && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <Badge
              key={product.id}
              variant="secondary"
              className="flex items-center gap-2 pr-1"
            >
              {product.images?.[0]?.url && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="truncate max-w-32 text-sm">{product.name}</span>
                <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(product.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}