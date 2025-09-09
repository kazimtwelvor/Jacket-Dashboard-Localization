import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import * as XLSX from "xlsx"
import { format } from "date-fns"

import prismadb from "@/lib/prismadb"

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const storeId = params.storeId

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const body = await req.json()
    const {
      fileType,
      exportScope,
      categoryId,
      includeDeleted,
      includeImages,
      includeVariations,
      includeCategories,
      includeSEO,
      includeInventory,
      includePricing,
    } = body

    if (!fileType || !exportScope) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    if (fileType !== "xlsx" && fileType !== "csv") {
      return new NextResponse("Invalid file type", { status: 400 })
    }

    try {
      const whereClause: any = {
        storeId,
      }

      if (!includeDeleted) {
        whereClause.isDeleted = false
      }

      if (exportScope === "filtered" && categoryId) {
        whereClause.categoryId = categoryId
      }

      const products = await prismadb.product.findMany({
        where: whereClause,
        include: {
          category: includeCategories,
          images: includeImages
            ? {
                include: {
                  image: true,
                },
              }
            : false,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (products.length === 0) {
        return new NextResponse("No products found matching your criteria", { status: 404 })
      }

      const exportData = products.map((product) => {
        const productData: any = {
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description || "",
          isPublished: product.isPublished ? "Yes" : "No",
          isArchived: product.isArchived ? "Yes" : "No",
          isFeatured: product.isFeatured ? "Yes" : "No",
          isDeleted: product.isDeleted ? "Yes" : "No",
          createdAt: format(product.createdAt, "yyyy-MM-dd HH:mm:ss"),
          updatedAt: format(product.updatedAt, "yyyy-MM-dd HH:mm:ss"),
          storeId: product.storeId,

          productType: product.productType || "variable",

          isVirtual: product.isVirtual ? "Yes" : "No",
          isDownloadable: product.isDownloadable ? "Yes" : "No",

          // purchaseNote: product.purchaseNote || "",
        }

        productData.categoryId = product.categoryId
        if (product.category) {
          productData.categoryName = product.category.name
        }

        productData.price = product.price.toString()
        productData.salePrice = product.salePrice ? product.salePrice.toString() : ""
        productData.isDiscounted = product.isDiscounted ? "Yes" : "No"
        // productData.originalPrice = product.originalPrice ? product.originalPrice.toString() : ""

        productData.stockStatus = product.stockStatus || "instock"

        if (product.colorDetails) {
          try {
            const colorDetails = Array.isArray(product.colorDetails) ? product.colorDetails : []
            productData.colors = colorDetails.map((color: any) => color.name).join(", ")
            productData.colorValues = colorDetails.map((color: any) => color.value).join(", ")
            productData.colorDetailsJSON = JSON.stringify(product.colorDetails)
          } catch (e) {
            productData.colors = ""
            productData.colorValues = ""
            productData.colorDetailsJSON = ""
          }
        }

        if (product.sizeDetails) {
          try {
            const sizeDetails = Array.isArray(product.sizeDetails) ? product.sizeDetails : []
            productData.sizes = sizeDetails.map((size: any) => size.name).join(", ")
            productData.sizeValues = sizeDetails.map((size: any) => size.value).join(", ")
            productData.sizeDetailsJSON = JSON.stringify(product.sizeDetails)
          } catch (e) {
            productData.sizes = ""
            productData.sizeValues = ""
            productData.sizeDetailsJSON = ""
          }
        }

        if (product.colorLinks) {
          try {
            productData.colorLinks = JSON.stringify(product.colorLinks)
          } catch (e) {
            productData.colorLinks = ""
          }
        }

        if (product.specifications) {
          try {
            productData.specifications = JSON.stringify(product.specifications)
          } catch (e) {
            productData.specifications = ""
          }
        }

        if (product.material && Array.isArray(product.material)) {
          productData.material = product.material.join(", ")
        }

        if (product.style && Array.isArray(product.style)) {
          productData.style = product.style.join(", ")
        }

        if (product.tags && Array.isArray(product.tags)) {
          productData.tags = product.tags.join(", ")
        }

        productData.gender = product.gender || ""

        productData.metaTitle = product.metaTitle || ""
        productData.metaDescription = product.metaDescription || ""
        productData.slug = product.slug || ""
        // productData.noIndex = product.noIndex ? "Yes" : "No"
        productData.brandName = product.brandName || ""
        // productData.ratingValue = product.ratingValue || ""
        // productData.reviewCount = product.reviewCount || ""
        productData.schema = product.schema || ""

        if (product.keywords) {
          try {
            const keywords = Array.isArray(product.keywords) ? product.keywords : []
            productData.keywords = keywords.join(", ")
          } catch (e) {
            productData.keywords = ""
          }
        }

        if (product.images) {
          const imageUrls = product.images.map((img: any) => img.image?.url || "").filter(Boolean)
          productData.imageUrls = imageUrls.join(", ")
          productData.mainImage = imageUrls[0] || ""

          const imageIds = product.images.map((img: any) => img.imageId).filter(Boolean)
          productData.imageIds = imageIds.join(", ")

          try {
            const imageDetails = product.images.map((img: any) => ({
              id: img.imageId,
              url: img.image?.url,
              isPrimary: img.isPrimary,
              order: img.order,
              altText: img.image?.altText,
              title: img.image?.title,
            }))
            productData.imageDetailsJSON = JSON.stringify(imageDetails)
          } catch (e) {
            productData.imageDetailsJSON = ""
          }
        }

        return productData
      })

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      XLSX.utils.book_append_sheet(workbook, worksheet, "Products")

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: fileType })

      const timestamp = format(new Date(), "yyyyMMdd_HHmmss")
      const fileName = `products_export_${timestamp}.${fileType}`

      const exportConfig = {
        exportScope,
        categoryId,
        includeDeleted,
        includeImages,
        includeVariations,
        includeCategories,
        includeSEO,
        includeInventory,
        includePricing,
      }

      try {
        await prismadb.exportLog.create({
          data: {
            storeId,
            fileName,
            fileType,
            productCount: products.length,
            status: "completed",
            exportConfig: JSON.stringify(exportConfig),
          },
        })
      } catch (logError) {
      }

      return new NextResponse(buffer, {
        headers: {
          "Content-Disposition": `attachment; filename=${fileName}`,
          "Content-Type":
            fileType === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
        },
      })
    } catch (dbError) {
      return new NextResponse(`Database error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`, {
        status: 500,
      })
    }
  } catch (error) {
    return new NextResponse(`Internal error: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    })
  }
}
