"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import type { ReviewColumn } from "./columns"
import { Separator } from "@/components/ui/separator"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  review: ReviewColumn | null
  allReviews: ReviewColumn[]
  productName: string
  onStatusChange: () => void
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  review, 
  allReviews,
  productName,
  onStatusChange
}) => {
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [currentReview, setCurrentReview] = useState<ReviewColumn | null>(null)
  const params = useParams()

  useEffect(() => {
    if (review) {
      const index = allReviews.findIndex(r => r.id === review.id)
      if (index !== -1) {
        setCurrentIndex(index)
        setCurrentReview(allReviews[index])
      } else {
        setCurrentReview(review)
      }
    } else if (allReviews.length > 0) {
      setCurrentReview(allReviews[0])
    }
    
  }, [review, allReviews, isOpen])

  useEffect(() => {
    if (allReviews.length > 0 && currentIndex >= 0 && currentIndex < allReviews.length) {
      setCurrentReview(allReviews[currentIndex])
    }
  }, [currentIndex, allReviews])

  const handleNext = () => {
    if (currentIndex < allReviews.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const onApprove = async () => {
    if (!currentReview) return
    
    try {
      setLoading(true)
      await axios.patch(`/api/${params.storeId}/reviews/${currentReview.id}`, { isApproved: true })
      onStatusChange()
      toast.success("Review approved successfully.")
    } catch {
      toast.error("Error approving review")
    } finally {
      setLoading(false)
    }
  }

  const onReject = async () => {
    if (!currentReview) return
    
    try {
      setLoading(true)
      await axios.patch(`/api/${params.storeId}/reviews/${currentReview.id}`, { isApproved: false })
      onStatusChange()
      toast.success("Review rejected successfully.")
    } catch {
      toast.error("Error rejecting review")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (!currentReview) return
    
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/reviews/${currentReview.id}`)
      onStatusChange()
      toast.success("Review deleted successfully.")
      onClose()
    } catch {
      toast.error("Error deleting review")
    } finally {
      setLoading(false)
    }
  }

  if (!currentReview) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[70%] sm:h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span className="truncate">{productName}</span>
            <Badge variant={currentReview.isApproved ? "success" : "destructive"}>
              {currentReview.isApproved ? "Approved" : "Pending"}
            </Badge>
          </DialogTitle>
          <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
            <span>Review {currentIndex + 1} of {allReviews.length}</span>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrevious} 
                disabled={currentIndex === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNext} 
                disabled={currentIndex === allReviews.length - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{currentReview.createdAt}</span>
            </div>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < currentReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allReviews.map((review, index) => (
              <div 
                key={review.id} 
                className={`border ${currentIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'} p-4 rounded-md cursor-pointer hover:border-primary/50 transition-colors`}
                onClick={() => setCurrentIndex(index)}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-sm">
                    {review.userName || 'Anonymous'}
                  </p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                
                {review.title && (
                  <p className="text-sm font-medium mb-1">{review.title}</p>
                )}
                
                <p className="text-sm text-gray-600 line-clamp-3">
                  {review.comment || 'No comment provided'}
                </p>
              </div>
            ))}
          </div>
          
          <div className="border border-gray-200 p-4 rounded-md">
            <div className="mb-3">
              <h3 className="font-bold text-lg">Customer</h3>
              <p className="text-base" data-testid="customer-name">
                {currentReview.userName || 'Anonymous'}
              </p>
            </div>
            
            <div className="mb-3">
              <h3 className="font-bold text-lg">Review</h3>
              <p className="text-base" data-testid="review-comment">
                {currentReview.comment || 'No comment provided'}
              </p>
            </div>
            
            {currentReview.title && (
              <div>
                <h3 className="font-bold text-lg">Title</h3>
                <p className="text-base">{currentReview.title}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDelete}
              disabled={loading}
            >
              Delete
            </Button>
            
            <div className="flex gap-2">
              {currentReview.isApproved ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onReject}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onApprove}
                  disabled={loading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}