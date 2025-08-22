"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatter } from "@/lib/utils"

interface ProductPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    price: number | string
    salePrice?: number | string | null
    description?: string
    sku?: string
    stockStatus?: string
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    specifications?: string
    isFeatured: boolean
    isPublished: boolean
    isArchived: boolean
    createdByName?: string
    createdAt: string
    relatedProducts?: Array<{
      id: string
      name: string
      sku?: string
      imageUrl?: string
    }>
    images?: Array<{
      id: string
      image: {
        id: string
        url: string
        altText?: string
      }
    }>
  }
}

export const ProductPreviewModal = ({ isOpen, onClose, product }: ProductPreviewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  if (!product) return null
  
  // Get all product images - handle both API response format and table format
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => {
        // API response format: { id, url, altText, ... }
        if (img.url) return img.url
        // Table format: { image: { url } }
        if (img.image?.url) return img.image.url
        return null
      }).filter(Boolean)
    : ["/placeholder.svg"]
  
  // Ensure we always have at least one image
  const displayImages = images.length > 0 ? images : ["/placeholder.svg"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const isValidSalePrice = (price: string | undefined | null): boolean => {
    if (!price) return false
    const numericPrice = Number.parseFloat(price.replace(/[^0-9.-]+/g, ""))
    return numericPrice > 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Product Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Left side - Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/5] bg-gray-100 overflow-hidden">
              <Image
                src={displayImages[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
              />
              {displayImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                      currentImageIndex === index ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                {product.isPublished ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300">
                    Draft
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300">
                    Featured
                  </Badge>
                )}
                {product.isArchived && (
                  <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-300">
                    Archived
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </span>
                {isValidSalePrice(product.salePrice?.toString()) && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${typeof product.salePrice === 'number' ? product.salePrice.toFixed(2) : product.salePrice}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {product.sku && (
                <div className="flex justify-between">
                  <span className="font-medium">SKU:</span>
                  <span>{product.sku}</span>
                </div>
              )}

              {product.stockStatus && (
                <div className="flex justify-between">
                  <span className="font-medium">Stock Status:</span>
                  <Badge 
                    variant="outline" 
                    className={
                      product.stockStatus === "instock" 
                        ? "bg-green-500/10 text-green-700 border-green-300"
                        : "bg-red-500/10 text-red-700 border-red-300"
                    }
                  >
                    {product.stockStatus === "instock" ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              )}
            </div>

            {product.description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {product.description?.replace(/<[^>]*>/g, '') || 'No description available'}
                  </div>
                </div>
              </>
            )}

            {product.specifications && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Specifications</h3>
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      try {
                        // Handle both string and object specifications
                        const specs = typeof product.specifications === 'string' 
                          ? JSON.parse(product.specifications)
                          : product.specifications
                        
                        if (!specs || typeof specs !== 'object') {
                          return <span>No specifications available</span>
                        }
                        
                        return (
                          <div className="space-y-2">
                            {Object.entries(specs).map(([key, value]) => {
                              let displayValue = ''
                              if (Array.isArray(value)) {
                                displayValue = value.join(', ')
                              } else if (typeof value === 'object' && value !== null) {
                                displayValue = JSON.stringify(value)
                              } else {
                                displayValue = String(value || '')
                              }
                              return (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                  <span>{displayValue}</span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      } catch (error) {
                        console.error('Error parsing specifications:', error)
                        return <span>Error loading specifications</span>
                      }
                    })()} 
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="font-medium mb-2">SEO Information</h3>
              <div className="space-y-2 text-sm">
                {product.metaTitle && (
                  <div>
                    <span className="font-medium">Meta Title:</span>
                    <p className="text-muted-foreground mt-1">{product.metaTitle}</p>
                  </div>
                )}
                {product.metaDescription && (
                  <div>
                    <span className="font-medium">Meta Description:</span>
                    <p className="text-muted-foreground mt-1">{product.metaDescription?.replace(/<[^>]*>/g, '') || 'No meta description'}</p>
                  </div>
                )}
                {product.keywords && product.keywords.length > 0 && (
                  <div>
                    <span className="font-medium">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {product.relatedProducts && product.relatedProducts.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-3">Related Products</h3>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {product.relatedProducts.map((relatedProduct: any) => (
                      <div key={relatedProduct.id} className="flex items-center gap-3 p-2 border rounded-lg">
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={relatedProduct.imageUrl || "/placeholder.svg"}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{relatedProduct.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {relatedProduct.sku || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2 text-sm text-muted-foreground">
              {product.createdByName && (
                <div className="flex justify-between">
                  <span>Created by:</span>
                  <span>{product.createdByName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}