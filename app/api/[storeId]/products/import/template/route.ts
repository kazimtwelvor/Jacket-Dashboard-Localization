import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import * as XLSX from "xlsx"

import prismadb from "@/lib/prismadb"

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const storeId = params.storeId

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

    // Get file type from query params
    const { searchParams } = new URL(req.url)
    const fileType = searchParams.get("fileType") || "xlsx"

    if (fileType !== "xlsx" && fileType !== "csv") {
      return new NextResponse("Invalid file type. Only xlsx and csv are supported.", { status: 400 })
    }

    // Get categories for the template
    const categories = await prismadb.category.findMany({
      where: {
        storeId,
      },
      select: {
        id: true,
        name: true,
      },
    })

    // Create template data with example values
    const templateData = [
      {
        // Required fields
        name: "Example Product",
        sku: "PROD-001",
        price: "99.99",

        // Basic product info
        description: "This is an example product description.",
        isPublished: "Yes",
        isArchived: "No",
        isFeatured: "No",
        isDeleted: "No",

        // Category
        categoryId: categories.length > 0 ? categories[0].id : "",
        categoryName: categories.length > 0 ? categories[0].name : "Default Category",

        // Pricing
        salePrice: "79.99",
        originalPrice: "129.99",
        isDiscounted: "Yes",

        // Inventory
        stockStatus: "instock", // instock, outofstock, onbackorder

        // Variations
        colors: "Red, Blue, Green",
        colorValues: "#FF0000, #0000FF, #00FF00",
        sizes: "S, M, L",
        sizeValues: "Small, Medium, Large",

        // Product details
        material: "Cotton, Polyester",
        style: "Casual, Modern",
        tags: "summer, sale, new",
        gender: "unisex",

        // SEO fields
        metaTitle: "Example Product | Your Store",
        metaDescription: "This is an example product meta description for SEO.",
        slug: "example-product",
        keywords: "example, product, template",
        noIndex: "No",
        brandName: "Your Brand",
        ratingValue: "4.5",
        reviewCount: "10",

        // Additional fields
        // purchaseNote: "Thank you for your purchase!",
        productType: "variable", // simple, variable, grouped, etc.
        isVirtual: "No",
        isDownloadable: "No",

        // Image placeholders
        imageUrls: "https://example.com/image1.jpg, https://example.com/image2.jpg",
        mainImage: "https://example.com/image1.jpg",

        // JSON fields (as strings)
        colorDetailsJSON: JSON.stringify([
          { name: "Red", value: "#FF0000" },
          { name: "Blue", value: "#0000FF" },
          { name: "Green", value: "#00FF00" },
        ]),
        sizeDetailsJSON: JSON.stringify([
          { name: "S", value: "Small" },
          { name: "M", value: "Medium" },
          { name: "L", value: "Large" },
        ]),
        colorLinks: JSON.stringify({
          red: "product-red-id",
          blue: "product-blue-id",
        }),
        specifications: JSON.stringify({
          weight: "0.5kg",
          dimensions: "10 x 20 x 5 cm",
          material: "Cotton",
        }),
      },
    ]

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(templateData)

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: fileType })

    // Generate filename
    const fileName = `product_import_template.${fileType}`

    // Return the file directly as a download
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Content-Type":
          fileType === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
      },
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
