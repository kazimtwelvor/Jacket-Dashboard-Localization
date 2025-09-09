import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import * as XLSX from "xlsx"

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

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    const updateExisting = formData.get("updateExisting") === "true"
    const createMissing = formData.get("createMissing") === "true"
    const validateOnly = formData.get("validateOnly") === "true"

    const fileName = file.name
    const fileExtension = fileName.split(".").pop()?.toLowerCase()

    if (fileExtension !== "xlsx" && fileExtension !== "csv") {
      return new NextResponse("Invalid file format. Only XLSX and CSV files are supported.", { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(fileBuffer, { type: "array" })

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      return new NextResponse("File contains no data", { status: 400 })
    }

    const validationErrors: any[] = []
    const validRows: any[] = []

    const requiredFields = ["name", "sku", "price"]

    jsonData.forEach((row: any, index) => {
      const rowErrors: string[] = []

      requiredFields.forEach((field) => {
        if (row[field] === undefined || row[field] === null || row[field] === "") {
          rowErrors.push(`Missing required field: ${field}`)
        }
      })

      if (row.price && isNaN(Number(row.price))) {
        rowErrors.push("Price must be a number")
      }

      if (row.salePrice && isNaN(Number(row.salePrice))) {
        rowErrors.push("Sale price must be a number")
      }

      // if (row.originalPrice && isNaN(Number(row.originalPrice))) {
      //   rowErrors.push("Original price must be a number")
      // }

      if (row.sku && !/^[a-zA-Z0-9-_]+$/.test(row.sku)) {
        rowErrors.push("SKU must contain only letters, numbers, hyphens, and underscores")
      }

      const booleanFields = [
        "isPublished",
        "isArchived",
        "isFeatured",
        "isDeleted",
        "isDiscounted",
        "noIndex",
        "isVirtual",
        "isDownloadable",
      ]
      booleanFields.forEach((field) => {
        if (
          row[field] !== undefined &&
          row[field] !== null &&
          row[field] !== "" &&
          !["Yes", "No", "yes", "no", "true", "false", "TRUE", "FALSE"].includes(String(row[field]))
        ) {
          rowErrors.push(`${field} must be "Yes" or "No"`)
        }
      })

      if (rowErrors.length > 0) {
        validationErrors.push({
          row: index + 2, 
          sku: row.sku || `Row ${index + 2}`,
          errors: rowErrors,
        })
      } else {
        validRows.push(row)
      }
    })

    if (validateOnly) {
      let errorLogUrl = null

      if (validationErrors.length > 0) {
        errorLogUrl = `/api/${storeId}/products/import/errors?timestamp=${Date.now()}`
      }

      const importLog = await prismadb.importLog.create({
        data: {
          storeId,
          fileName,
          fileType: fileExtension || "unknown",
          totalRows: jsonData.length,
          successCount: validRows.length,
          errorCount: validationErrors.length,
          status: "completed",
          errorLogUrl,
        },
      })

      return NextResponse.json({
        success: true,
        totalRows: jsonData.length,
        validRows: validRows.length,
        invalidRows: validationErrors.length,
        errorLogUrl,
        errors: validationErrors,
      })
    }

    if (validationErrors.length > 0) {
      const errorLogUrl = `/api/${storeId}/products/import/errors?timestamp=${Date.now()}`

      const importLog = await prismadb.importLog.create({
        data: {
          storeId,
          fileName,
          fileType: fileExtension || "unknown",
          totalRows: jsonData.length,
          successCount: 0,
          errorCount: validationErrors.length,
          status: "failed",
          errorLogUrl,
        },
      })

      return NextResponse.json(
        {
          success: false,
          message: `Import failed with ${validationErrors.length} validation errors`,
          totalRows: jsonData.length,
          errorCount: validationErrors.length,
          errorLogUrl,
          errors: validationErrors,
        },
        { status: 400 },
      )
    }

    // Process the import
    const importResults = {
      totalRows: validRows.length,
      successCount: 0,
      errorCount: 0,
      errors: [] as any[],
    }

    for (const row of validRows) {
      try {
        const existingProduct = await prismadb.product.findFirst({
          where: {
            storeId,
            sku: row.sku,
          },
          include: {
            images: true,
          },
        })

        if (existingProduct) {
          if (updateExisting) {
            const updateData: any = {
              name: row.name,
              price: Number.parseFloat(row.price),
            }

            const processBooleanField = (value: any) => {
              if (value === undefined || value === null || value === "") return undefined
              return ["Yes", "yes", "true", "TRUE"].includes(String(value))
            }

            if (row.description !== undefined) updateData.description = row.description
            if (row.isPublished !== undefined) updateData.isPublished = processBooleanField(row.isPublished)
            if (row.isArchived !== undefined) updateData.isArchived = processBooleanField(row.isArchived)
            if (row.isFeatured !== undefined) updateData.isFeatured = processBooleanField(row.isFeatured)
            if (row.isDeleted !== undefined) updateData.isDeleted = processBooleanField(row.isDeleted)

            if (row.categoryId) {
              const categoryExists = await prismadb.category.findFirst({
                where: {
                  id: row.categoryId,
                  storeId,
                },
              })

              if (categoryExists) {
                updateData.categoryId = row.categoryId
              }
            } else if (row.categoryName) {
              const category = await prismadb.category.findFirst({
                where: {
                  name: row.categoryName,
                  storeId,
                },
              })

              if (category) {
                updateData.categoryId = category.id
              }
            }

            if (row.salePrice !== undefined) {
              updateData.salePrice = row.salePrice ? Number.parseFloat(row.salePrice) : null
            }
            // if (row.originalPrice !== undefined) {
            //   updateData.originalPrice = row.originalPrice ? Number.parseFloat(row.originalPrice) : 0
            // }
            if (row.isDiscounted !== undefined) updateData.isDiscounted = processBooleanField(row.isDiscounted)

            if (row.stockStatus !== undefined) updateData.stockStatus = row.stockStatus

            // if (row.purchaseNote !== undefined) updateData.purchaseNote = row.purchaseNote
            if (row.productType !== undefined) updateData.productType = row.productType
            if (row.isVirtual !== undefined) updateData.isVirtual = processBooleanField(row.isVirtual)
            if (row.isDownloadable !== undefined) updateData.isDownloadable = processBooleanField(row.isDownloadable)

            try {
              if (row.colorDetailsJSON) {
                updateData.colorDetails = JSON.parse(row.colorDetailsJSON)
              } else if (row.colors && row.colorValues) {
                const colors = String(row.colors)
                  .split(",")
                  .map((c: string) => c.trim())
                const colorValues = String(row.colorValues)
                  .split(",")
                  .map((v: string) => v.trim())

                updateData.colorDetails = colors.map((name: string, index: number) => ({
                  name,
                  value: colorValues[index] || "#000000",
                }))
              }

              if (row.sizeDetailsJSON) {
                updateData.sizeDetails = JSON.parse(row.sizeDetailsJSON)
              } else if (row.sizes && row.sizeValues) {
                const sizes = String(row.sizes)
                  .split(",")
                  .map((s: string) => s.trim())
                const sizeValues = String(row.sizeValues)
                  .split(",")
                  .map((v: string) => v.trim())

                updateData.sizeDetails = sizes.map((name: string, index: number) => ({
                  name,
                  value: sizeValues[index] || name,
                }))
              }

              if (row.colorLinks) {
                updateData.colorLinks = typeof row.colorLinks === "string" ? JSON.parse(row.colorLinks) : row.colorLinks
              }

              if (row.specifications) {
                updateData.specifications =
                  typeof row.specifications === "string" ? JSON.parse(row.specifications) : row.specifications
              }
            } catch (jsonError) {
            }

            if (row.material)
              updateData.material = String(row.material)
                .split(",")
                .map((item: string) => item.trim())
            if (row.style)
              updateData.style = String(row.style)
                .split(",")
                .map((item: string) => item.trim())
            if (row.tags)
              updateData.tags = String(row.tags)
                .split(",")
                .map((item: string) => item.trim())
            if (row.keywords)
              updateData.keywords = String(row.keywords)
                .split(",")
                .map((item: string) => item.trim())

            if (row.metaTitle !== undefined) updateData.metaTitle = row.metaTitle
            if (row.metaDescription !== undefined) updateData.metaDescription = row.metaDescription
            if (row.slug !== undefined) updateData.slug = row.slug
            if (row.noIndex !== undefined) updateData.noIndex = processBooleanField(row.noIndex)
            if (row.brandName !== undefined) updateData.brandName = row.brandName
            if (row.ratingValue !== undefined) updateData.ratingValue = row.ratingValue
            if (row.reviewCount !== undefined) updateData.reviewCount = row.reviewCount
            if (row.schema !== undefined) updateData.schema = row.schema
            if (row.gender !== undefined) updateData.gender = row.gender

            if (row.imageDetailsJSON) {
              try {
                const imageDetails = JSON.parse(row.imageDetailsJSON)


              } catch (e) {
              }
            }

            await prismadb.product.update({
              where: {
                id: existingProduct.id,
              },
              data: updateData,
            })

            importResults.successCount++
          } else {
            importResults.errorCount++
            importResults.errors.push({
              row: validRows.indexOf(row) + 2,
              sku: row.sku,
              errors: ["Product with this SKU already exists and update option is disabled"],
            })
          }
        } else {
          if (createMissing) {
            let categoryId = null
            if (row.categoryId) {
              const categoryExists = await prismadb.category.findFirst({
                where: {
                  id: row.categoryId,
                  storeId,
                },
              })

              if (categoryExists) {
                categoryId = row.categoryId
              }
            } else if (row.categoryName) {
              const category = await prismadb.category.findFirst({
                where: {
                  name: row.categoryName,
                  storeId,
                },
              })

              if (category) {
                categoryId = category.id
              } else {
                const slug = row.categoryName
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")

                try {
                  const newCategory = await prismadb.category.create({
                    data: {
                      name: row.categoryName,
                      slug,
                      storeId,
                    },
                  })
                  categoryId = newCategory.id
                } catch (categoryError) {
                  const defaultCategory = await prismadb.category.findFirst({
                    where: {
                      storeId,
                    },
                  })

                  if (defaultCategory) {
                    categoryId = defaultCategory.id
                  } else {
                    throw new Error("No category available and couldn't create one")
                  }
                }
              }
            } else {
              const defaultCategory = await prismadb.category.findFirst({
                where: {
                  storeId,
                },
              })

              if (defaultCategory) {
                categoryId = defaultCategory.id
              } else {
                throw new Error("No category specified and no default category available")
              }
            }

            const processBooleanField = (value: any) => {
              if (value === undefined || value === null || value === "") return false
              return ["Yes", "yes", "true", "TRUE"].includes(String(value))
            }

            let colorDetails = []
            try {
              if (row.colorDetailsJSON) {
                colorDetails = JSON.parse(row.colorDetailsJSON)
              } else if (row.colors && row.colorValues) {
                const colors = String(row.colors)
                  .split(",")
                  .map((c: string) => c.trim())
                const colorValues = String(row.colorValues)
                  .split(",")
                  .map((v: string) => v.trim())

                colorDetails = colors.map((name: string, index: number) => ({
                  name,
                  value: colorValues[index] || "#000000",
                }))
              }
            } catch (e) {
            }

            let sizeDetails = []
            try {
              if (row.sizeDetailsJSON) {
                sizeDetails = JSON.parse(row.sizeDetailsJSON)
              } else if (row.sizes && row.sizeValues) {
                const sizes = String(row.sizes)
                  .split(",")
                  .map((s: string) => s.trim())
                const sizeValues = String(row.sizeValues)
                  .split(",")
                  .map((v: string) => v.trim())

                sizeDetails = sizes.map((name: string, index: number) => ({
                  name,
                  value: sizeValues[index] || name,
                }))
              }
            } catch (e) {
            }

            let colorLinks = {}
            try {
              if (row.colorLinks) {
                colorLinks = typeof row.colorLinks === "string" ? JSON.parse(row.colorLinks) : row.colorLinks
              }
            } catch (e) {
            }

            let specifications = {}
            try {
              if (row.specifications) {
                specifications =
                  typeof row.specifications === "string" ? JSON.parse(row.specifications) : row.specifications
              }
            } catch (e) {
            }

            const material = row.material
              ? String(row.material)
                  .split(",")
                  .map((item: string) => item.trim())
              : []
            const style = row.style
              ? String(row.style)
                  .split(",")
                  .map((item: string) => item.trim())
              : []
            const tags = row.tags
              ? String(row.tags)
                  .split(",")
                  .map((item: string) => item.trim())
              : []
            const keywords = row.keywords
              ? String(row.keywords)
                  .split(",")
                  .map((item: string) => item.trim())
              : []

            const newProduct = await prismadb.product.create({
              data: {
                id: row.id || undefined, 
                name: row.name,
                sku: row.sku,
                price: Number.parseFloat(row.price),
                description: row.description || "",
                salePrice: row.salePrice ? Number.parseFloat(row.salePrice) : null,
                // originalPrice: row.originalPrice ? Number.parseFloat(row.originalPrice) : 0,
                isPublished: processBooleanField(row.isPublished),
                isArchived: processBooleanField(row.isArchived),
                isFeatured: processBooleanField(row.isFeatured),
                isDeleted: processBooleanField(row.isDeleted),
                isDiscounted: processBooleanField(row.isDiscounted),
                stockStatus: row.stockStatus || "instock",
                storeId,
                categoryId: categoryId,
                colorDetails,
                sizeDetails,
                colorLinks,
                specifications,
                material,
                style,
                tags,
                keywords,
                gender: row.gender || null,
                metaTitle: row.metaTitle || null,
                metaDescription: row.metaDescription || null,
                slug: row.slug || null,
                noIndex: processBooleanField(row.noIndex),
                brandName: row.brandName || null,
                ratingValue: row.ratingValue || null,
                reviewCount: row.reviewCount || null,
                schema: row.schema || null,
                // purchaseNote: row.purchaseNote || null,
                productType: row.productType || "variable",
                isVirtual: processBooleanField(row.isVirtual),
                isDownloadable: processBooleanField(row.isDownloadable),
              },
            })

            if (row.imageDetailsJSON) {
              try {
                const imageDetails = JSON.parse(row.imageDetailsJSON)


              } catch (e) {
              }
            }

            importResults.successCount++
          } else {
            importResults.errorCount++
            importResults.errors.push({
              row: validRows.indexOf(row) + 2,
              sku: row.sku,
              errors: ["Product with this SKU does not exist and create option is disabled"],
            })
          }
        }
      } catch (error) {
        importResults.errorCount++
        importResults.errors.push({
          row: validRows.indexOf(row) + 2,
          sku: row.sku,
          errors: [(error as Error).message || "Unknown error"],
        })
      }
    }

    let errorLogUrl = null
    if (importResults.errors.length > 0) {
      errorLogUrl = `/api/${storeId}/products/import/errors?timestamp=${Date.now()}`
    }

    const importLog = await prismadb.importLog.create({
      data: {
        storeId,
        fileName,
        fileType: fileExtension || "unknown",
        totalRows: importResults.totalRows,
        successCount: importResults.successCount,
        errorCount: importResults.errorCount,
        status: importResults.errorCount === 0 ? "completed" : "completed_with_errors",
        errorLogUrl,
      },
    })

    return NextResponse.json({
      success: true,
      ...importResults,
      errorLogUrl,
    })
  } catch (error) {
    return new NextResponse(`Internal error: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    })
  }
}
