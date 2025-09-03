import prismadb from "@/lib/prismadb"
import { AttributesClient } from "./components/client"
import { format } from "date-fns"
import { redirect } from "next/navigation"

const Page = async ({
  params,
  searchParams,
}: {
  params: { storeId: string }
  searchParams: { tab?: string; action?: string }
}) => {
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

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (searchParams.action === "new") {
    switch (searchParams.tab) {
      case "categories":
        redirect(`/${params.storeId}/categories/new`)
      case "sizes":
        redirect(`/${params.storeId}/sizes/new`)
      case "colors":
        redirect(`/${params.storeId}/colors/new`)
    }
  }

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isDeleted: false,
    },
    select: {
      categoryData: true,
      sizeDetails: true,
      colorDetails: true,
    },
  })

  const formattedCategories = categories.map((item) => {
    const productCount = products.filter((product) => {
      const categoryData = product.categoryData as any
      if (!categoryData) return false
      
      const { material, style, gender } = categoryData
      return (
        material === item.name ||
        style === item.name ||
        gender === item.name ||
        (Array.isArray(material) && material.includes(item.name)) ||
        (Array.isArray(style) && style.includes(item.name))
      )
    }).length

    return {
      id: item.id,
      name: item.name,
      productCount,
      type: item.type || "regular",
      description: item.description || null,
      imageUrl: item.imageUrl || null,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }
  })

  const formattedSizes = sizes.map((item) => {
    const productCount = products.filter((product) => {
      const sizeDetails = product.sizeDetails as any
      if (!sizeDetails || !Array.isArray(sizeDetails)) return false
      return sizeDetails.some((size: any) => size.name === item.name || size.value === item.value)
    }).length

    return {
      id: item.id,
      name: item.name,
      value: item.value,
      productCount,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }
  })

  const formattedColors = colors.map((item) => {
    const productCount = products.filter((product) => {
      const colorDetails = product.colorDetails as any
      if (!colorDetails || !Array.isArray(colorDetails)) return false
      return colorDetails.some((color: any) => color.name === item.name || color.value === item.value)
    }).length

    return {
      id: item.id,
      name: item.name,
      value: item.value,
      value2: item.value2,
      productCount,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AttributesClient
        categories={formattedCategories}
        sizes={formattedSizes}
        colors={formattedColors}
        initialTab={searchParams.tab || "categories"}
      />
    </div>
  )
}

export default Page
