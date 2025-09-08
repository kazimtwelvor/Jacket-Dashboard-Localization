"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReviewColumn } from "./columns"
import { ProductReviewCard } from "./product-review-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ProductReviewsGridProps {
  data: ReviewColumn[]
}

export const ProductReviewsGrid: React.FC<ProductReviewsGridProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()
  
  const groupedReviews = data.reduce((acc, review) => {
    if (!acc[review.productName]) {
      acc[review.productName] = []
    }
    acc[review.productName].push(review)
    return acc
  }, {} as Record<string, ReviewColumn[]>)
  
  const filteredProducts = Object.keys(groupedReviews)
    .filter(productName => 
      productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort()
  
  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1)
    router.refresh()
  }
  
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [data])
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(productName => (
          <ProductReviewCard
            key={`${productName}-${refreshKey}`}
            productName={productName}
            reviews={groupedReviews[productName]}
            onStatusChange={handleStatusChange}
          />
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full flex justify-center items-center p-8 border rounded-md">
            <p className="text-muted-foreground">
              {searchTerm ? "No products match your search" : "No reviews found"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}