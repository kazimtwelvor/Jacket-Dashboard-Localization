"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarIcon } from "lucide-react"
import { format } from "date-fns"

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  title?: string
  createdAt: Date
  product: {
    name: string
  }
}

interface RecentReviewsProps {
  reviews: Review[]
  className?: string
}

export function RecentReviews({ reviews, className }: RecentReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No reviews yet</div>
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                  <AvatarFallback>{review.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">{review.title || `Review for ${review.product.name}`}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
