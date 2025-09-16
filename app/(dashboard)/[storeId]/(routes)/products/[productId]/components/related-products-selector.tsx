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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!storeId) return

    const searchProducts = async () => {
      // Only search if there's a search term
      if (!searchTerm.trim()) {
        setProducts([])
        return
      }

      try {
        setLoading(true)
        const searchQuery = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm)}` : ''
        const response = await fetch(`/api/${storeId}/products?admin=true${searchQuery}`)
        const data = await response.json()
        const allProducts = data.products || data || []
        const filteredProducts = currentProductId 
          ? allProducts.filter((product: Product) => product.id !== currentProductId)
          : allProducts
        setProducts(filteredProducts)
        

      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [storeId, currentProductId, searchTerm])

  // Load selected products when value changes
  useEffect(() => {
    if (!storeId || !value.length) {
      setSelectedProducts([])
      return
    }

    const loadSelectedProducts = async () => {
      try {
        const response = await fetch(`/api/${storeId}/products?admin=true&limit=2000`)
        const data = await response.json()
        const allProducts = data.products || data || []
        const selectedProductsData = allProducts.filter((product: Product) => value.includes(product.id))
        setSelectedProducts(selectedProductsData)
      } catch (error) {
        console.error('Error loading selected products:', error)
      }
    }

    loadSelectedProducts()
  }, [storeId, value])

  const handleSelect = (productId: string) => {
    if (value.includes(productId)) {
      onChange(value.filter((id) => id !== productId))
    } else {
      onChange([...value, productId])
      // Add the selected product to selectedProducts if it's not already there
      const selectedProduct = products.find(p => p.id === productId)
      if (selectedProduct && !selectedProducts.find(p => p.id === productId)) {
        setSelectedProducts(prev => [...prev, selectedProduct])
      }
    }
  }

  const handleRemove = (productId: string) => {
    onChange(value.filter((id) => id !== productId))
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
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
            <CommandInput 
              placeholder="Search products by name or SKU..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>
              {loading ? "Loading products..." : searchTerm.trim() ? "No products found" : "Start typing to search all products"}
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-72">
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={`${product.name} ${product.sku}`}
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