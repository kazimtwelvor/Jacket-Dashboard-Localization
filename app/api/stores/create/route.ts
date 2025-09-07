import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { z } from "zod"

// Helper function to create a unique slug from a name and store ID
const createUniqueSlug = (name: string, storeId: string) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return `${baseSlug}-${storeId.slice(0, 8)}`
}

// Define validation schema for store creation
const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = storeSchema.parse(body)


    const result = await db.$transaction(
      async (tx) => {
        try {
          const newStore = await tx.store.create({
            data: {
              name: validatedData.name,
              userId,
              url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${validatedData.name.toLowerCase().replace(/\s+/g, "-")}`,
            },
          })

          // Create default billboard
          const billboard = await tx.billboard.create({
            data: {
              label: "Default Categories",
              imageUrl: "https://via.placeholder.com/1920x1080?text=Default+Categories",
              storeId: newStore.id,
            },
          })

          // Define default categories - reduced number for faster creation
          const defaultCategories = [
            // Materials - reduced set
            { name: "Leather", type: "material" },
            { name: "Denim", type: "material" },
            { name: "Wool", type: "material" },

            // Styles - reduced set
            { name: "Bomber", type: "style" },
            { name: "Puffer", type: "style" },
            { name: "Varsity", type: "style" },
            { name: "Biker", type: "style" },
            { name: "Blazer", type: "style" },

            // Genders
            { name: "Men", type: "gender" },
            { name: "Women", type: "gender" },
            { name: "Unisex", type: "gender" },
          ]

          // Define default colors - reduced set
          const defaultColors = [
            { name: "Black", value: "#000000" },
            { name: "White", value: "#FFFFFF" },
            { name: "Red", value: "#FF0000" },
            { name: "Blue", value: "#0000FF" },
            { name: "Green", value: "#00FF00" },
          ]

          // Define default sizes - reduced set
          const defaultSizes = [
            { name: "XS", value: "XS" },
            { name: "S", value: "S" },
            { name: "M", value: "M" },
            { name: "L", value: "L" },
            { name: "XL", value: "XL" },
          ]

          // Process in smaller batches instead of all at once
          const createCategories = async () => {
            const results = []
            for (const category of defaultCategories) {
              const result = await tx.category.create({
                data: {
                  name: category.name,
                  type: category.type,
                  billboardId: billboard.id,
                  storeId: newStore.id,
                  slug: createUniqueSlug(category.name, newStore.id),
                },
              })
              results.push(result)
            }
            return results
          }

          const createColors = async () => {
            const results = []
            for (const color of defaultColors) {
              const result = await tx.color.create({
                data: {
                  name: color.name,
                  value: color.value,
                  storeId: newStore.id,
                },
              })
              results.push(result)
            }
            return results
          }

          const createSizes = async () => {
            const results = []
            for (const size of defaultSizes) {
              const result = await tx.size.create({
                data: {
                  name: size.name,
                  value: size.value,
                  storeId: newStore.id,
                },
              })
              results.push(result)
            }
            return results
          }

          // Execute sequentially instead of in parallel to reduce database load
          const categories = await createCategories()
          const colors = await createColors()
          const sizes = await createSizes()


          // Verify all creations
          const [createdCategories, createdColors, createdSizes, createdBillboard] = await Promise.all([
            tx.category.count({ where: { storeId: newStore.id } }),
            tx.color.count({ where: { storeId: newStore.id } }),
            tx.size.count({ where: { storeId: newStore.id } }),
            tx.billboard.findFirst({ where: { storeId: newStore.id } }),
          ])

          if (!createdBillboard) {
            throw new Error("Billboard was not created successfully")
          }

          if (
            createdCategories !== defaultCategories.length ||
            createdColors !== defaultColors.length ||
            createdSizes !== defaultSizes.length
          ) {
            throw new Error(
              `Data mismatch - Expected: ${defaultCategories.length} categories, ${defaultColors.length} colors, and ${defaultSizes.length} sizes. ` +
                `Got: ${createdCategories} categories, ${createdColors} colors, and ${createdSizes} sizes`,
            )
          }

          return {
            ...newStore,
            _counts: {
              categories: createdCategories,
              colors: createdColors,
              sizes: createdSizes,
            },
          }
        } catch (error) {
          throw error // This will trigger a rollback
        }
      },
      {
        timeout: 30000, // Increased timeout to 30 seconds (from default 5 seconds)
      },
    )

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse(`Internal error: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    })
  }
}
