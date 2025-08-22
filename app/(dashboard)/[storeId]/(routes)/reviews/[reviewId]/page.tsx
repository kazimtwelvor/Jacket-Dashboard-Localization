import prismadb from "@/lib/prismadb"
import { ReviewForm } from "./components/review-form"

const Page = async ({
  params,
}: {
  params: { reviewId: string; storeId: string }
}) => {
  const { reviewId, storeId } = params

  const review =
    reviewId === "new"
      ? null
      : await prismadb.review.findUnique({
          where: {
            id: reviewId,
          },
        })

  const products = await prismadb.product.findMany({
    where: {
      storeId: storeId,
    },
  })

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ReviewForm initialData={review} products={products} />
      </div>
    </div>
  )
}

export default Page
