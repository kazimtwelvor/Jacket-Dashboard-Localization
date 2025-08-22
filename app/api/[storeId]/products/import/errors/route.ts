import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import * as XLSX from "xlsx"

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const storeId = params.storeId
    const { searchParams } = new URL(req.url)
    const timestamp = searchParams.get("timestamp") || Date.now().toString()

    // In a real implementation, you would retrieve the error log from your storage service
    // For this example, we'll return a dummy error log

    const errorData = [
      {
        row: 2,
        sku: "PROD-001",
        errors: "Missing required field: price",
      },
      {
        row: 3,
        sku: "PROD-002",
        errors: "Price must be a number",
      },
      {
        row: 4,
        sku: "PROD-003",
        errors: "Product with this SKU already exists and update option is disabled",
      },
    ]

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(errorData)

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Import Errors")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Generate filename
    const fileName = `import_errors_${timestamp}.xlsx`

    // Return the error log file
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  } catch (error) {
    console.error("[PRODUCTS_IMPORT_ERRORS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
