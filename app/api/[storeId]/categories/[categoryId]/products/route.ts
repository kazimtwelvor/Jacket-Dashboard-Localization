import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string; categoryId: string } }) {
  try {
    const { storeId, categoryId } = params

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 })
    }

    const category = await prismadb.category.findFirst({
      where: {
        id: categoryId,
        storeId: storeId,
      },
    })

    if (!category) {
      return new NextResponse("Category not found or does not belong to this store", { status: 404 })
    }

   
    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
        isPublished: true,
      
      },
      include: {
        images: {
          include: {
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const filteredProducts = products.filter((product) => {
      if (!product.categoryData) return false
      
      const categoryData = product.categoryData as any
      const categoryType = category.type || 'material'
      
      return categoryData[categoryType] === category.name
    })

    const serializedProducts = filteredProducts.map((product) => ({
      ...product,
      price: product.price.toString(),
      // originalPrice: product.originalPrice.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : null,
      images: product.images.map((productImage) => ({
        id: productImage.imageId,
        url: productImage.image.url,
      })),
      sizeDetails: product.sizeDetails || null,
      colorDetails: product.colorDetails || null,
      specifications: product.specifications || null,
      colorLinks: product.colorLinks || null,
      categoryData: product.categoryData,
    }))

    const response = NextResponse.json(serializedProducts)
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
