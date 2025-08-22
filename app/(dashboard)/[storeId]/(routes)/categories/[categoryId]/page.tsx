import prismadb from "@/lib/prismadb"
import { CategoryForm } from "./components/category-form"
import { redirect } from "next/navigation"

const CategoryPage = async ({
  params,
}: {
  params: { categoryId: string; storeId: string }
}) => {
  const categoryId = params.categoryId
  const storeId = params.storeId

  const category = await prismadb.category.findUnique({
    where: {
      id: categoryId,
    },
  })

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: storeId,
    },
  })

  const goBack = () => {
    return redirect(`/${storeId}/attributes?tab=categories`)
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <CategoryForm billboards={billboards} initialData={category} />
      </div>
    </div>
  )
}

export default CategoryPage
