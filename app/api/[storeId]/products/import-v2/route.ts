import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import * as XLSX from "xlsx"

interface ProductImportRow {
  name: string
  sku: string
  price: string | number
  
  description?: string
  salePrice?: string | number
  stockStatus?: string
  isFeatured?: string | boolean
  isArchived?: string | boolean
  isPublished?: string | boolean
  categoryMaterial?: string
  categoryStyle?: string
  categoryGender?: string
  gender?: string
  brandName?: string
  metaTitle?: string
  metaDescription?: string
  slug?: string
  keywords?: string
  tags?: string
  sizesJson?: string
  colorsJson?: string
  imageUrls?: string
  specifications?: string
  isParentProduct?: string | boolean
  parentProductId?: string
  relatedProducts?: string
  colorLinks?: string
  schema?: string
}

interface ValidationError {
  row: number
  field: string
  message: string
  value?: any
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth()
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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const validateOnly = formData.get("validateOnly") === "true"
    const updateExisting = formData.get("updateExisting") === "true"

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) {
      return new NextResponse("Invalid file format. Only CSV and XLSX files are supported.", { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()
    let jsonData: any[]

    if (fileName.endsWith('.xlsx')) {
      const workbook = XLSX.read(fileBuffer, { type: "array" })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      jsonData = XLSX.utils.sheet_to_json(worksheet)
    } else {
      const csvText = new TextDecoder().decode(fileBuffer)
      const workbook = XLSX.read(csvText, { 
        type: "string",
        raw: false,
        cellDates: false,
        cellNF: false,
        cellText: false
      })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: ""
      })
    }

    if (jsonData.length === 0) {
      return new NextResponse("File contains no data", { status: 400 })
    }
    const validationErrors: ValidationError[] = []
    const validRows: ProductImportRow[] = []
    const requiredFields = ['name', 'sku', 'price']

    const user = await prismadb.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true, email: true },
    })

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as ProductImportRow
      const rowNum = i + 2 

      for (const field of requiredFields) {
        if (!row[field as keyof ProductImportRow] || String(row[field as keyof ProductImportRow]).trim() === '') {
          validationErrors.push({
            row: rowNum,
            field,
            message: `${field} is required`,
            value: row[field as keyof ProductImportRow]
          })
          continue
        }
      }

      if (row.price && isNaN(Number(row.price))) {
        validationErrors.push({
          row: rowNum,
          field: 'price',
          message: 'Price must be a valid number',
          value: row.price
        })
      }

      if (row.salePrice && isNaN(Number(row.salePrice))) {
        validationErrors.push({
          row: rowNum,
          field: 'salePrice',
          message: 'Sale price must be a valid number',
          value: row.salePrice
        })
      }

      if (row.sku && !/^[A-Z0-9\-_]+$/i.test(String(row.sku))) {
        validationErrors.push({
          row: rowNum,
          field: 'sku',
          message: 'SKU can only contain letters, numbers, hyphens, and underscores',
          value: row.sku
        })
      }

      if (row.stockStatus && !['instock', 'outofstock', 'onbackorder'].includes(String(row.stockStatus).toLowerCase())) {
        validationErrors.push({
          row: rowNum,
          field: 'stockStatus',
          message: 'Stock status must be one of: instock, outofstock, onbackorder',
          value: row.stockStatus
        })
      }

      if (row.gender && !['men', 'women', 'unisex', 'kids'].includes(String(row.gender).toLowerCase())) {
        validationErrors.push({
          row: rowNum,
          field: 'gender',
          message: 'Gender must be one of: men, women, unisex, kids',
          value: row.gender
        })
      }

      const jsonFields = ['sizesJson', 'colorsJson', 'specifications', 'colorLinks']
      for (const field of jsonFields) {
        const value = row[field as keyof ProductImportRow]
        if (value && typeof value === 'string' && value.trim()) {
          try {
            let cleanValue = value.trim()
            if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
              cleanValue = cleanValue.slice(1, -1)
            }
            cleanValue = cleanValue.replace(/""/g, '"')
            JSON.parse(cleanValue)
          } catch (error) {
            validationErrors.push({
              row: rowNum,
              field,
              message: `${field} must be valid JSON. Example: {"key":"value"} or [{"id":"1","name":"Item"}]`,
              value: value.length > 100 ? value.substring(0, 100) + '...' : value
            })
          }
        }
      }

      const rowHasErrors = validationErrors.some(error => error.row === rowNum)
      if (!rowHasErrors) {
        validRows.push(row)
      }
    }

    if (validateOnly) {
      return NextResponse.json({
        success: true,
        message: `Validation complete. ${validRows.length} valid rows, ${validationErrors.length} errors found.`,
        validRows: validRows.length,
        totalRows: jsonData.length,
        errors: validationErrors
      })
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Validation failed. ${validationErrors.length} errors found.`,
        errors: validationErrors
      }, { status: 400 })
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[]
    }

    for (const row of validRows) {
      try {
        const existingProduct = await prismadb.product.findFirst({
          where: {
            sku: String(row.sku),
            storeId: storeId
          }
        })

        if (existingProduct && !updateExisting) {
          results.skipped++
          continue
        }

        const productData: any = {
          name: String(row.name),
          sku: String(row.sku),
          price: Number(row.price),
          description: row.description ? String(row.description) : null,
          salePrice: row.salePrice ? Number(row.salePrice) : null,
          stockStatus: row.stockStatus ? String(row.stockStatus).toLowerCase() : 'instock',
          isFeatured: parseBooleanField(row.isFeatured),
          isArchived: parseBooleanField(row.isArchived),
          isPublished: row.isPublished !== undefined ? parseBooleanField(row.isPublished) : true,
          isParentProduct: parseBooleanField(row.isParentProduct),
          parentProductId: row.parentProductId || null,
          gender: row.gender ? String(row.gender).toLowerCase() : null,
          brandName: row.brandName || null,
          metaTitle: row.metaTitle || null,
          metaDescription: row.metaDescription || null,
          slug: row.slug || null,
          schema: row.schema || null,
          priority: 4, 
          storeId: storeId,
          createdById: user?.id || null,
          createdByName: user?.name || "Import",
          createdByEmail: user?.email || null,
          ...(existingProduct && {
            updatedById: user?.id || null,
            updatedByName: user?.name || "Import",
            updatedByEmail: user?.email || null,
          })
        }

        if (row.categoryMaterial || row.categoryStyle || row.categoryGender) {
          productData.categoryData = {
            material: row.categoryMaterial || '',
            style: row.categoryStyle || '',
            gender: row.categoryGender || row.gender || ''
          }
        }

        if (row.keywords) {
          productData.keywords = String(row.keywords).split(',').map(k => k.trim()).filter(k => k)
        }

        if (row.tags) {
          productData.tags = String(row.tags).split(',').map(t => t.trim()).filter(t => t)
        }

        if (row.relatedProducts) {
          productData.relatedProducts = String(row.relatedProducts).split(',').map(p => p.trim()).filter(p => p)
        }

        const jsonFields = ['sizesJson', 'colorsJson', 'specifications', 'colorLinks']
        for (const field of jsonFields) {
          const value = row[field as keyof ProductImportRow]
          if (value && typeof value === 'string' && value.trim()) {
            try {
              let cleanValue = value.trim()
              if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                cleanValue = cleanValue.slice(1, -1)
              }
              cleanValue = cleanValue.replace(/""/g, '"')
              
              const dbField = field.replace('Json', 'Details').replace('Json', '')
              const finalField = dbField === 'sizesDetails' ? 'sizeDetails' : dbField === 'colorsDetails' ? 'colorDetails' : dbField
              productData[finalField] = JSON.parse(cleanValue)
            } catch (error) {
            }
          }
        }

        if (existingProduct && updateExisting) {
          await prismadb.product.update({
            where: { id: existingProduct.id },
            data: productData
          })
          results.updated++
        } else if (!existingProduct) {
          await prismadb.product.create({
            data: productData
          })
          results.created++
        }

      } catch (error) {
        results.errors.push({
          sku: row.sku,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. Created: ${results.created}, Updated: ${results.updated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
      results
    })

  } catch (error) {
    console.error("[PRODUCTS_IMPORT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

function parseBooleanField(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim()
    return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1'
  }
  return false
}
