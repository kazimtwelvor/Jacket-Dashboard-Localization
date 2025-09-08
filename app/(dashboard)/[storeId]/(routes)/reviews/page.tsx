import { format } from "date-fns"
import prismadb from "@/lib/prismadb"
import { ReviewClient } from "./components/client"
import type { ReviewColumn } from "./components/columns"

const Page = async (props: {
  params: { storeId: string }
}) => {
  const { storeId } = props.params

  const reviews = await prismadb.review.findMany({
    where: {
      storeId: storeId,
      product: {
        isDeleted: false, 
      },
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const pendingCount = reviews.filter((review) => !review.isApproved).length
  const approvedCount = reviews.filter((review) => review.isApproved).length

  const formattedReviews: ReviewColumn[] = reviews.map((item) => ({
    id: item.id,
    productName: item.product.name,
    userName: item.userName,
    rating: item.rating,
    title: item.title || "",
    comment: item.comment,
    isApproved: item.isApproved,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ReviewClient data={formattedReviews} pendingCount={pendingCount} approvedCount={approvedCount} />
      </div>
    </div>
  )
}

export default Page
