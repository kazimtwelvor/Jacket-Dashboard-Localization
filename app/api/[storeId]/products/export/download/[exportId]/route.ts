import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import * as XLSX from "xlsx"
import { format } from "date-fns"

import prismadb from "@/lib/prismadb"

export async function GET(req: NextRequest, { params }: { params: { storeId: string; exportId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const storeId = params.storeId
    const exportId = params.exportId

    // Check if the store belongs to the user
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    // Get the export log
    const exportLog = await prismadb.exportLog.findFirst({
      where: {
        id: exportId,
        storeId,
      },
    })

    if (!exportLog) {
      return new NextResponse("Export not found", { status: 404 })
    }

    // Parse the export configuration
    let exportConfig = {}
    try {
      if (exportLog.exportConfig) {
        exportConfig = JSON.parse(exportLog.exportConfig)
      }
    } catch (e) {
      console.error("Failed to parse export config:", e)
      // Continue with default config if parsing fails
    }

    const {
      exportScope = "all",
      categoryId,
      includeDeleted = false,
      includeImages = true,
      includeVariations = true,
      includeCategories = true,
      includeSEO = false,
      includeInventory = true,
      includePricing = true,
    } = exportConfig as any

    // Build the query based on export scope
    const whereClause: any = {
      storeId,
    }

    // Handle deleted products
    if (!includeDeleted) {
      whereClause.isDeleted = false
    }

    // Handle category filter
    if (exportScope === "filtered" && categoryId) {
      whereClause.categoryId = categoryId
    }

    // Get products with the constructed where clause
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

    // Transform products for export - include ALL fields
    const exportData = products.map((product) => {
      // Base product data
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

        // Product classification
        productType: product.productType || "variable",

        // Virtual/downloadable
        isVirtual: product.isVirtual ? "Yes" : "No",
        isDownloadable: product.isDownloadable ? "Yes" : "No",

        // Purchase note
        purchaseNote: product.purchaseNote || "",
      }

      // Add category data
      productData.categoryId = product.categoryId
      if (product.category) {
        productData.categoryName = product.category.name
      }

      // Add pricing data
      productData.price = product.price.toString()
      productData.salePrice = product.salePrice ? product.salePrice.toString() : ""
      productData.isDiscounted = product.isDiscounted ? "Yes" : "No"
      productData.originalPrice = product.originalPrice ? product.originalPrice.toString() : ""

      // Add inventory data
      productData.stockStatus = product.stockStatus || "instock"

      // Add variation data
      // Handle color details
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

      // Handle size details
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

      // Add color links
      if (product.colorLinks) {
        try {
          productData.colorLinks = JSON.stringify(product.colorLinks)
        } catch (e) {
          productData.colorLinks = ""
        }
      }

      // Add specifications
      if (product.specifications) {
        try {
          productData.specifications = JSON.stringify(product.specifications)
        } catch (e) {
          productData.specifications = ""
        }
      }

      // Add arrays
      if (product.material && Array.isArray(product.material)) {
        productData.material = product.material.join(", ")
      }

      if (product.style && Array.isArray(product.style)) {
        productData.style = product.style.join(", ")
      }

      if (product.tags && Array.isArray(product.tags)) {
        productData.tags = product.tags.join(", ")
      }

      // Add gender
      productData.gender = product.gender || ""

      // Add SEO data
      productData.metaTitle = product.metaTitle || ""
      productData.metaDescription = product.metaDescription || ""
      productData.slug = product.slug || ""
      productData.noIndex = product.noIndex ? "Yes" : "No"
      productData.brandName = product.brandName || ""
      productData.ratingValue = product.ratingValue || ""
      productData.reviewCount = product.reviewCount || ""
      productData.schema = product.schema || ""

      // Handle keywords
      if (product.keywords) {
        try {
          const keywords = Array.isArray(product.keywords) ? product.keywords : []
          productData.keywords = keywords.join(", ")
        } catch (e) {
          productData.keywords = ""
        }
      }

      // Add image data
      if (product.images) {
        const imageUrls = product.images.map((img: any) => img.image?.url || "").filter(Boolean)
        productData.imageUrls = imageUrls.join(", ")
        productData.mainImage = imageUrls[0] || ""

        // Add image IDs for reference
        const imageIds = product.images.map((img: any) => img.imageId).filter(Boolean)
        productData.imageIds = imageIds.join(", ")

        // Add image details as JSON
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

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: exportLog.fileType })

    // Update the last downloaded timestamp
    await prismadb.exportLog.update({
      where: {
        id: exportId,
      },
      data: {
        lastDownloadedAt: new Date(),
      },
    })

    // Return the file directly as a download
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename=${exportLog.fileName}`,
        "Content-Type":
          exportLog.fileType === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      },
    })
  } catch (error) {
    console.error("[PRODUCTS_EXPORT_DOWNLOAD]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
