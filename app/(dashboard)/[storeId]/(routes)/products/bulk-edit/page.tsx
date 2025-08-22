import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { BulkEditFormWrapper } from "../components/bulk-edit-form-wrapper"

interface BulkEditPageProps {
  params: {
    storeId: string
  }
  searchParams: {
    ids?: string
  }
}

const BulkEditPage = async ({ params, searchParams }: BulkEditPageProps) => {
  // Get the authenticated user
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Verify store ownership
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  })

  if (!store) {
    redirect("/")
  }

  // Get product IDs from query params
  const productIds = searchParams.ids?.split(",") || []

  if (productIds.length === 0) {
    redirect(`/${params.storeId}/products`)
  }

  // Fetch products
  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      storeId: params.storeId,
    },
    include: {
      category: true,
      size: true,
      color: true,
      images: true,
    },
  })

  // Fetch categories for dropdown
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  })

  // Fetch sizes for dropdown
  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
  })

  // Fetch colors for dropdown
  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BulkEditFormWrapper
          products={products}
          categories={categories}
          sizes={sizes}
          colors={colors}
          storeId={params.storeId}
        />
      </div>
    </div>
  )
}

export default BulkEditPage
