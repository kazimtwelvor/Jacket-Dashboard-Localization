
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus, Check } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { type ReviewColumn } from "./columns"
import { ApiList } from "@/components/ui/api-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductReviewsGrid } from "./product-review-grid"
import { toast } from "react-hot-toast"
import axios from "axios"

interface ReviewClientProps {
  data: ReviewColumn[]
  pendingCount: number
  approvedCount: number
}

export const ReviewClient: React.FC<ReviewClientProps> = ({ data, pendingCount, approvedCount }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()

  const pendingReviews = data.filter((review) => !review.isApproved)
  const approvedReviews = data.filter((review) => review.isApproved)

  const onApproveAllPending = async () => {
    try {
      setLoading(true)
      await Promise.all(
        pendingReviews.map(review => 
          axios.patch(`/api/${params.storeId}/reviews/${review.id}`, { isApproved: true })
        )
      )
      toast.success(`${pendingReviews.length} reviews approved successfully.`)
      router.refresh()
    } catch (error) {
      toast.error("Error approving reviews")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Reviews (${data?.length})`} description="Manage customer reviews for your store" />
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button onClick={onApproveAllPending} disabled={loading}>
              <Check className="w-4 h-4 mr-2" />
              Approve All Pending ({pendingCount})
            </Button>
          )}
          <Button onClick={() => router.push(`/${params.storeId}/reviews/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Test Review
          </Button>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <p className="text-amber-800 text-sm">
            You have <strong>{pendingCount}</strong> pending {pendingCount === 1 ? "review" : "reviews"} that{" "}
            {pendingCount === 1 ? "requires" : "require"} approval. Switch to the "Pending" tab to review them.
          </p>
        </div>
      )}

      <Separator />

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Reviews ({data.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ProductReviewsGrid data={data} />
        </TabsContent>
        <TabsContent value="pending">
          <ProductReviewsGrid data={pendingReviews} />
        </TabsContent>
        <TabsContent value="approved">
          <ProductReviewsGrid data={approvedReviews} />
        </TabsContent>
      </Tabs>

      <Heading title="API" description="API calls for Reviews" />
      <Separator />
      <ApiList entityName="reviews" entityIdName="reviewId" />
    </>
  )
}
