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

    // Verify the category exists and belongs to this store
    const category = await prismadb.category.findFirst({
      where: {
        id: categoryId,
        storeId: storeId,
      },
    })

    if (!category) {
      return new NextResponse("Category not found or does not belong to this store", { status: 404 })
    }

    // Since categoryId has been removed from products, we need to filter by categoryData
    // Get the category details to match against product categoryData
    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
        isPublished: true,
        // Note: Since categoryId is removed, we can't directly filter by category
        // You might need to implement a different filtering mechanism based on categoryData
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

    // Filter products based on categoryData matching the category type and name
    const filteredProducts = products.filter((product) => {
      if (!product.categoryData) return false
      
      const categoryData = product.categoryData as any
      const categoryType = category.type || 'material'
      
      // Check if the product's categoryData contains this category
      return categoryData[categoryType] === category.name
    })

    // Convert Decimal objects to strings for serialization
    const serializedProducts = filteredProducts.map((product) => ({
      ...product,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : null,
      // Format the images consistently with single product API
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
