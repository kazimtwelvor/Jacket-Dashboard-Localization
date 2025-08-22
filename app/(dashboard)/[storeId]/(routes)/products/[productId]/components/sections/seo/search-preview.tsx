"use client"

import type React from "react"
import { Smartphone, Star } from "lucide-react"

interface SearchPreviewProps {
  title: string
  description: string
  url: string
  price?: string
  rating?: number
  reviewCount?: number
  inStock?: boolean
}

export const SearchPreview: React.FC<SearchPreviewProps> = ({
  title,
  description,
  url,
  price = "$99.99",
  rating = 4,
  reviewCount = 42,
  inStock = true,
}) => {
  const displayUrl = url || "yourstore.com/products/product-name"
  const shortUrl = displayUrl.length > 30 ? displayUrl.substring(0, 30) + "..." : displayUrl

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4">
        <div className="text-blue-600 text-xl font-medium line-clamp-1">{title || "Your Product Title"}</div>
        <div className="text-green-700 text-sm mb-1">{displayUrl}</div>
        <div className="text-gray-700 text-sm line-clamp-2">
          {description ||
            "Your product description will appear here. Make sure to write a compelling description to attract clicks from search engine results."}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium mb-3 flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Mobile Preview
          </h3>
          <div className="border rounded-md p-3 max-w-[320px] mx-auto">
            <div className="text-blue-600 text-base font-medium line-clamp-1">{title || "Your Product Title"}</div>
            <div className="text-green-700 text-xs mb-1">{shortUrl}</div>
            <div className="text-gray-700 text-xs line-clamp-2">
              {description || "Your product description will appear here. Make sure to write a compelling description."}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" /> Rich Snippet Preview
          </h3>
          <div className="border rounded-md p-3">
            <div className="text-blue-600 text-base font-medium line-clamp-1">{title || "Your Product Title"}</div>
            <div className="text-green-700 text-xs mb-1">{displayUrl}</div>
            <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-current" : ""}`} />
              ))}
              <span className="text-gray-700">({reviewCount} reviews)</span>
            </div>
            <div className="text-gray-700 text-xs line-clamp-2">
              {description || "Your product description will appear here. Make sure to write a compelling description."}
            </div>
            <div className="text-gray-700 text-xs mt-1">
              {price} · {inStock ? "In stock" : "Out of stock"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
