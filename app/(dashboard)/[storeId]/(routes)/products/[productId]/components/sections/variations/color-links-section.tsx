"use client"

import type React from "react"
import { Link2, ExternalLink, Copy, Check, Search, X } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ProductFormValues } from "../../product-form-schema"

interface ColorLinksSectionProps {
  form: UseFormReturn<ProductFormValues>
  storeId?: string
  currentProductId?: string
  initialData?: any
}

interface Product {
  id: string
  name: string
  sku: string
  slug?: string
  image: string | null
}

export const ColorLinksSection: React.FC<ColorLinksSectionProps> = ({ form, storeId, currentProductId, initialData }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const selectedColors = form.watch("specifications.color") || []
  const variationColors = form.watch("categories.variationColors") || []
  const displayColors = selectedColors.length > 0 ? selectedColors : variationColors
  const [colorLinks, setColorLinks] = useState<Record<string, string>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({})
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [parentProducts, setParentProducts] = useState<Product[]>([])
  const [parentSearchTerm, setParentSearchTerm] = useState<string>("")
  const [selectedParentProduct, setSelectedParentProduct] = useState<Product | null>(null)
  const [dropdownPositions, setDropdownPositions] = useState<Record<string, {top: number, left: number}>>({})
  const [searchResults, setSearchResults] = useState<Record<string, Product[]>>({})
  const [isSearching, setIsSearching] = useState<Record<string, boolean>>({})


  useEffect(() => {
    const currentValue = form.getValues("isParentProduct")
    const parentProductIdValue = form.getValues("parentProductId")

    if (initialData) {
      if (currentValue === undefined && initialData.isParentProduct !== undefined) {
        form.setValue("isParentProduct", Boolean(initialData.isParentProduct), { shouldDirty: false })
      }

      if (!parentProductIdValue && initialData.parentProductId) {
        form.setValue("parentProductId", initialData.parentProductId, { shouldDirty: false })
      }
    }

    if (parentProductIdValue && !selectedParentProduct) {
      const foundParent = products.find(p => p.id === parentProductIdValue)
      if (foundParent) {
        setSelectedParentProduct(foundParent)
        fetchParentColorLinks(parentProductIdValue)
      }
    }
  }, [form, initialData, products, selectedParentProduct])

  useEffect(() => {
    if (initialData?.parentProductId && !selectedParentProduct && storeId) {
      fetch(`/api/${storeId}/parent-products?search=`)
        .then(res => res.json())
        .then(data => {
          const foundParent = data.find((p: Product) => p.id === initialData.parentProductId)
          if (foundParent) {
            setSelectedParentProduct(foundParent)
            fetchParentColorLinks(initialData.parentProductId)
          } else {
          }
        })
        .catch(error => {
        })
    }
  }, [initialData, selectedParentProduct, storeId])

  useEffect(() => {
    if (!storeId) return

    fetch(`/api/${storeId}/products?admin=true&includeArchived=true`)
      .then(res => res.json())
      .then(data => {
        const formatted = (data.products || [])
          .filter((p: any) => p.id !== currentProductId)
          .map((p: any) => ({ id: p.id, name: p.name, sku: p.sku, slug: p.slug, image: p.images?.[0]?.url || null }))
        setProducts(formatted)
      })
      .catch(console.error)
  }, [storeId, currentProductId])

  useEffect(() => {
    if (!storeId) return

    const searchParentProducts = async () => {
      try {
        const response = await fetch(`/api/${storeId}/parent-products?search=${encodeURIComponent(parentSearchTerm)}`)
        const data = await response.json()
        setParentProducts(data)
      } catch (error) {
      }
    }

    const debounceTimer = setTimeout(searchParentProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [storeId, parentSearchTerm])

  const searchProductsForColor = async (color: string, searchTerm: string) => {
    if (!storeId) {
      return
    }
    
    if (!searchTerm.trim()) {
      setIsSearching(prev => ({ ...prev, [color]: false }))
      return
    }

    setIsSearching(prev => ({ ...prev, [color]: true }))
    try {
      const response = await fetch(`/api/${storeId}/products?search=${encodeURIComponent(searchTerm)}&admin=true&includeArchived=true`)
      if (response.ok) {
        const data = await response.json()
        const formatted = (data.products || [])
          .filter((p: any) => p.id !== currentProductId)
          .map((p: any) => ({ 
            id: p.id, 
            name: p.name, 
            sku: p.sku, 
            slug: p.slug, 
            image: p.images && p.images.length > 0 ? p.images[0].url : null 
          }))
        setSearchResults(prev => ({ ...prev, [color]: formatted }))
      } else {
        console.error('API response not ok:', response.status, response.statusText)
        setSearchResults(prev => ({ ...prev, [color]: [] }))
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults(prev => ({ ...prev, [color]: [] }))
    } finally {
      setIsSearching(prev => ({ ...prev, [color]: false }))
    }
  }

  useEffect(() => {
    if (!storeId) return

    const searchTimers: Record<string, NodeJS.Timeout> = {}

    Object.keys(searchTerms).forEach(color => {
      const searchTerm = searchTerms[color]
      if (searchTerm !== undefined) {
        searchTimers[color] = setTimeout(() => {
          searchProductsForColor(color, searchTerm)
        }, 300)
      }
    })

    return () => {
      Object.values(searchTimers).forEach(timer => clearTimeout(timer))
    }
  }, [storeId, searchTerms, currentProductId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setTimeout(() => {
        Object.keys(showDropdown).forEach(color => {
          if (showDropdown[color] && dropdownRefs.current[color] && !dropdownRefs.current[color]?.contains(event.target as Node)) {
            setShowDropdown(prev => ({ ...prev, [color]: false }))
          }
        })
      }, 10)
    }

    const handleScroll = (event: Event) => {
      const hasOpenDropdown = Object.values(showDropdown).some(isOpen => isOpen)
      if (!hasOpenDropdown) return

      const target = event.target as Element
      
      const isScrollingInsideDropdown = Object.values(dropdownRefs.current).some(ref =>
        ref && ref.contains(target)
      )

      const isDropdownElement = target?.closest('[data-dropdown="true"]')
      
      const isDropdownScrollArea = target?.classList.contains('dropdown-scroll-area') ||
                                   target?.closest('.dropdown-scroll-area')

      if (!isScrollingInsideDropdown && !isDropdownElement && !isDropdownScrollArea) {
        setShowDropdown({})
      }
    }

    const handleWindowScroll = () => {
      const hasOpenDropdown = Object.values(showDropdown).some(isOpen => isOpen)
      if (hasOpenDropdown) {
        setShowDropdown({})
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)
    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('scroll', handleWindowScroll)
    }
  }, [showDropdown])

  useEffect(() => {
    const links = form.getValues("categories.colorVariationLinks") || {}
    const cleanLinks: Record<string, string> = {}
    displayColors.forEach(color => {
      cleanLinks[color] = links[color] || ""
    })
    setColorLinks(cleanLinks)
  }, [form, displayColors])

  const getFilteredProducts = (color: string) => {
    const term = searchTerms[color] || ""
    if (!term.trim()) {
      return products
    }
    
    const results = searchResults[color] || []
    return results
  }

  const fetchParentColorLinks = async (parentProductId: string) => {
    try {
      const response = await fetch(`/api/${storeId}/parent-color-links?parentProductId=${parentProductId}`)
      const data = await response.json()
      if (data.colorLinks) {
        setColorLinks(data.colorLinks)
        form.setValue("categories.colorVariationLinks", data.colorLinks, { shouldDirty: true })

        const parentColors = Object.keys(data.colorLinks)

        form.setValue("specifications.color", parentColors, { shouldDirty: true })
        form.setValue("categories.variationColors", parentColors, { shouldDirty: true })

      } else {
      }
    } catch (error) {
    }
  }

  const selectProduct = (color: string, product: Product) => {
    const url = `https://jacket.us.com/us/product/${product.slug}`
    const newLinks = { ...colorLinks, [color]: url }
    setColorLinks(newLinks)
    form.setValue("categories.colorVariationLinks", newLinks, { shouldDirty: true })
    setShowDropdown(prev => ({ ...prev, [color]: false }))
    setSearchTerms(prev => ({ ...prev, [color]: "" }))
    setSearchResults(prev => ({ ...prev, [color]: [] }))
    setIsSearching(prev => ({ ...prev, [color]: false }))
  }

  const updateLink = (color: string, value: string) => {
    const newLinks = { ...colorLinks, [color]: value }
    setColorLinks(newLinks)
    form.setValue("categories.colorVariationLinks", newLinks, { shouldDirty: true })
  }

  const updateDropdownPosition = (key: string) => {
    const button = buttonRefs.current[key]
    if (button) {
      const rect = button.getBoundingClientRect()
      setDropdownPositions(prev => ({
        ...prev,
        [key]: {
          top: rect.bottom + 8,
          left: rect.left
        }
      }))
    }
  }

  const copyLink = (color: string, link: string) => {
    if (link) {
      navigator.clipboard.writeText(link)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="h-5 w-5" />
        <h3 className="text-base font-medium">Color Variation Links</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Search and select products or enter URLs manually for each color variation.
      </p>

      <FormField
        control={form.control}
        name="isParentProduct"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center space-x-2 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <FormControl>
                <Checkbox
                  id="setAsParent"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <label
                htmlFor="setAsParent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Set this product as parent
              </label>
            </div>
          </FormItem>
        )}
      />

      {!form.watch("isParentProduct") && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-md border">
          <h4 className="text-sm font-medium mb-3">Select Parent Product</h4>
          <div className="flex items-center gap-2">
            <div className="relative" ref={el => { dropdownRefs.current['parent'] = el }}>
              <Button
                ref={el => { buttonRefs.current['parent'] = el }}
                variant="outline"
                size="sm"
                className="h-10 px-3"
                type="button"
                onClick={() => {
                  updateDropdownPosition('parent')
                  setShowDropdown(prev => ({ ...prev, parent: !prev.parent }))
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
              {showDropdown['parent'] && typeof window !== 'undefined' && createPortal(
                <div
                  data-dropdown="true"
                  className="fixed w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
                  style={{
                    maxHeight: '300px',
                    top: dropdownPositions['parent']?.top || 0,
                    left: dropdownPositions['parent']?.left || 0
                  }}
                  ref={el => { dropdownRefs.current['parent'] = el }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search parent products by name or SKU..."
                        value={parentSearchTerm}
                        onChange={(e) => setParentSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="pl-10 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                            <div 
                              className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 dropdown-scroll-area"
                              onScroll={(e) => e.stopPropagation()}
                            >
                              {parentProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setSelectedParentProduct(product)
                            form.setValue("parentProductId", product.id, { shouldDirty: true })
                            setParentSearchTerm("")
                            setShowDropdown(prev => ({ ...prev, parent: false }))
                            fetchParentColorLinks(product.id)
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer rounded-lg transition-colors duration-150 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                                {product.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-400 dark:text-gray-500">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>
                      ))}
                      {parentProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-3">
                            <Search className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {parentSearchTerm ? "No parent products found" : "Start typing to search parent products"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {parentSearchTerm ? "Try a different search term" : "Search by product name or SKU"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
            {selectedParentProduct && (
              <div className="flex-1 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded overflow-hidden bg-gray-100">
                      {selectedParentProduct.image ? (
                        <img src={selectedParentProduct.image} alt={selectedParentProduct.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                          {selectedParentProduct.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{selectedParentProduct.name}</div>
                      <div className="text-xs text-gray-500">{selectedParentProduct.sku}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedParentProduct(null)
                      form.setValue("parentProductId", "", { shouldDirty: true })
                      form.setValue("categories.colorVariationLinks", {}, { shouldDirty: true })
                      form.setValue("specifications.color", [], { shouldDirty: true })
                      form.setValue("categories.variationColors", [], { shouldDirty: true })
                      setColorLinks({})
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {displayColors.length > 0 ? (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
          {displayColors.map((color) => (
            <div key={color} className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-400 shadow-sm flex-shrink-0"
                    style={{
                      backgroundColor: color.toLowerCase(),
                      borderColor: ["White", "Yellow", "Beige"].includes(color) ? "#999" : "transparent",
                    }}
                  />
                  <span className="text-sm font-medium min-w-[80px]">{color}:</span>
                </div>
                <div className="flex-1 relative">
                  <div className="flex gap-2">
                    <div className="relative" ref={el => { dropdownRefs.current[color] = el }}>
                      <Button
                        ref={el => { buttonRefs.current[color] = el }}
                        variant="outline"
                        size="sm"
                        className="h-10 px-3"
                        type="button"
                        disabled={!!selectedParentProduct}
                        onClick={() => {
                          updateDropdownPosition(color)
                          setShowDropdown(prev => ({ ...prev, [color]: !prev[color] }))
                        }}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      {showDropdown[color] && typeof window !== 'undefined' && createPortal(
                        <div
                          data-dropdown="true"
                          className="fixed w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
                          style={{
                            maxHeight: '300px',
                            top: dropdownPositions[color]?.top || 0,
                            left: dropdownPositions[color]?.left || 0
                          }}
                          ref={el => { dropdownRefs.current[color] = el }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-4">
                            <div className="relative mb-3">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search by product name or SKU..."
                                value={searchTerms[color] || ""}
                                onChange={(e) => setSearchTerms(prev => ({ ...prev, [color]: e.target.value }))}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                className="pl-10 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div 
                              className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 dropdown-scroll-area"
                              onScroll={(e) => e.stopPropagation()}
                            >
                              {isSearching[color] ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-3">
                                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                  </div>
                                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    Searching products...
                                  </p>
                                </div>
                              ) : (
                                <>
                                  {getFilteredProducts(color).map((product) => (
                                    <div
                                      key={product.id}
                                      onClick={() => selectProduct(color, product)}
                                      className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer rounded-lg transition-colors duration-150 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                                    >
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {product.image ? (
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                                            {product.name.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            {product.sku}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-gray-400 dark:text-gray-500">
                                        <ExternalLink className="h-4 w-4" />
                                      </div>
                                    </div>
                                  ))}
                                  {!isSearching[color] && getFilteredProducts(color).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-3">
                                        <Search className="h-6 w-6 text-gray-400" />
                                      </div>
                                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                                        {searchTerms[color] ? "No products found" : "No products available"}
                                      </p>
                                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {searchTerms[color] ? "Try a different search term" : "Start typing to search or browse all products"}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                    <Input
                      className={`flex-1 ${selectedParentProduct || colorLinks[color]?.includes('jacket.us.com') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder={selectedParentProduct ? `Inherited from parent: ${selectedParentProduct.name}` : colorLinks[color]?.includes('jacket.us.com') ? 'Generated from product selection' : `Enter URL for ${color} variation or use search`}
                      value={colorLinks[color] || ""}
                      onChange={(e) => updateLink(color, e.target.value)}
                      readOnly={!!selectedParentProduct || colorLinks[color]?.includes('jacket.us.com')}
                    />
                    {colorLinks[color] && (
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        disabled={!!selectedParentProduct}
                        onClick={() => updateLink(color, "")}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        disabled={!colorLinks[color]}
                        onClick={() => copyLink(color, colorLinks[color] || "")}
                      >
                        {copiedColor === color ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copiedColor === color ? "Copied!" : "Copy link"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        disabled={!colorLinks[color]}
                        onClick={() => colorLinks[color] && window.open(colorLinks[color], "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open link in new tab</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
          <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/20 rounded-md">
            <p><strong>Search:</strong> Click the search icon to find products by name or SKU</p>
            <p className="mt-1"><strong>Manual:</strong> Or enter the complete URL directly</p>
            <p className="mt-1">Example: https://jacket.us.com/us/product/product-name-in-red-color</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No colors selected. Please select colors in the Color Variations section first.
        </div>
      )}
    </div>
  )
}