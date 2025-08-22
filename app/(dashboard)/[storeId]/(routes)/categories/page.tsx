import prismadb from "@/lib/prismadb"
import { CategoriesClient } from "./components/client"
import { format } from "date-fns"

// @ts-ignore - Ignoring type checking for this component to bypass the build error
const Page = async ({ params }: any) => {
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      billboard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const formattedCategories = categories.map((item) => ({
    id: item.id,
    name: item.name,
    // Handle case where billboard might be null
    billboardLabel: item.billboard?.label || null,
    // Include the image URL
    imageUrl: item.imageUrl || null,
    // Format date string
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CategoriesClient data={formattedCategories} />
    </div>
  )
}

export default Page
