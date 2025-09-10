import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import * as XLSX from "xlsx"

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "csv"
    const storeId = params.storeId

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        userId: true,
        members: {
          where: {
            userId: userId,
          },
        },
      },
    })

    if (!store || (store.userId !== userId && store.members.length === 0)) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Fetch all products for the store
    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
      },
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format products data for export
    const exportData = products.map((product) => ({
      ID: product.id,
      Name: product.name,
      SKU: product.sku || "",
      Price: product.price.toString(),
      "Sale Price": product.salePrice?.toString() || "",
      Description: product.description || "",
      Category: product.categoryData && typeof product.categoryData === 'object' && product.categoryData !== null 
        ? `${(product.categoryData as any).material || ''} ${(product.categoryData as any).style || ''}`.trim() || "Uncategorized" 
        : "Uncategorized",
      "Stock Status": product.stockStatus || "instock",
      "Is Featured": product.isFeatured ? "Yes" : "No",
      "Is Archived": product.isArchived ? "Yes" : "No",
      "Is Published": product.isPublished ? "Yes" : "No",
      Gender: product.gender || "",
      "Brand Name": product.brandName || "",
      "Meta Title": product.metaTitle || "",
      "Meta Description": product.metaDescription || "",
      Slug: product.slug || "",
      Keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
      Tags: product.tags ? (Array.isArray(product.tags) ? product.tags.join(", ") : product.tags) : "",
      Sizes: product.sizeDetails
        ? JSON.parse(JSON.stringify(product.sizeDetails))
            .map((size: any) => size.name)
            .join(", ")
        : "",
      Colors: product.colorDetails
        ? JSON.parse(JSON.stringify(product.colorDetails))
            .map((color: any) => color.name)
            .join(", ")
        : "",
      "Image URLs": product.images
        .map((pi: any) => pi.image.url)
        .join("; "),
      "Created By": product.createdByName || "Unknown",
      "Updated By": product.updatedByName || "",
      "Created At": product.createdAt.toISOString(),
      "Updated At": product.updatedAt?.toISOString() || "",
      Specifications: product.specifications || "",
      "Is Parent Product": product.isParentProduct ? "Yes" : "No",
      "Parent Product ID": product.parentProductId || "",
      "Related Products": product.relatedProducts ? (Array.isArray(product.relatedProducts) ? product.relatedProducts.join(", ") : product.relatedProducts) : "",
    }))

    if (format === "xlsx") {
      // Create XLSX file
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products")
      
      // Generate buffer
      const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
      
      return new NextResponse(xlsxBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    } else {
      // Create CSV file
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(","),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row] || ""
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (value.toString().includes(",") || value.toString().includes('"') || value.toString().includes("\n")) {
              return `"${value.toString().replace(/"/g, '""')}"`
            }
            return value.toString()
          }).join(",")
        )
      ].join("\n")

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }
  } catch (error) {
    console.error("[PRODUCTS_EXPORT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}