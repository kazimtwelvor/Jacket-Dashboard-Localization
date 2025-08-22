"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Eye, Check, X } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import type { ReviewColumn } from "./columns"
import { ReviewModal } from "./review-modal"

interface ProductReviewCardProps {
  productName: string
  reviews: ReviewColumn[]
  onStatusChange: () => void
}

export const ProductReviewCard: React.FC<ProductReviewCardProps> = ({ productName, reviews, onStatusChange }) => {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ReviewColumn | null>(null)
  
  const router = useRouter()
  const params = useParams()

  const pendingCount = reviews.filter(review => !review.isApproved).length
  const approvedCount = reviews.filter(review => review.isApproved).length
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
    : "0.0"

  const onApproveAll = async () => {
    try {
      setLoading(true)
      const pendingReviews = reviews.filter(review => !review.isApproved)
      
      // Process reviews in parallel
      await Promise.all(
        pendingReviews.map(review => 
          axios.patch(`/api/${params.storeId}/reviews/${review.id}`, { isApproved: true })
        )
      )
      
      onStatusChange()
      toast.success(`${pendingReviews.length} reviews approved successfully.`)
    } catch (error) {
      toast.error("Error approving reviews")
    } finally {
      setLoading(false)
    }
  }

  const openReviewModal = (review: ReviewColumn) => {
    // Force a copy of the review object to ensure it's not affected by reference issues
    const reviewCopy = JSON.parse(JSON.stringify(review))
    console.log("Opening modal with review:", reviewCopy)
    setSelectedReview(reviewCopy)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold truncate">{productName}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-medium">{averageRating}</span>
              </div>
              <Badge variant="outline">{reviews.length} reviews</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge variant="success" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                {approvedCount} Approved
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {reviews.slice(0, 2).map((review) => (
              <div 
                key={review.id} 
                className="p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => openReviewModal(review)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.userName || 'Anonymous'}</span>
                  </div>
                  <Badge variant={review.isApproved ? "success" : "destructive"} className="text-xs">
                    {review.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                <div className="mt-1">
                  <p className="text-sm font-medium text-gray-700">"{review.comment || 'No comment provided'}"</p>
                </div>
              </div>
            ))}
            
            {reviews.length > 2 && (
              <Button 
                variant="ghost" 
                className="w-full text-sm h-8 mt-1"
                onClick={() => {
                  setSelectedReview(reviews[0])
                  setIsModalOpen(true)
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View all {reviews.length} reviews
              </Button>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          {pendingCount > 0 ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={onApproveAll}
              disabled={loading}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve All ({pendingCount})
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => router.push(`/${params.storeId}/products`)}
            >
              View Product
            </Button>
          )}
        </CardFooter>
      </Card>

      <ReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        review={selectedReview}
        allReviews={JSON.parse(JSON.stringify(reviews))}
        productName={productName}
        onStatusChange={onStatusChange}
      />
    </>
  )
}