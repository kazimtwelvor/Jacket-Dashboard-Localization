import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth()
    const { storeId } = params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const user = await prismadb.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const store = user.clerkId ? await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId: user.clerkId
      }
    }) : null

    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: storeId,
        OR: [
          { isOwner: true },
          { role: 'ADMIN' },
          { role: 'EDITOR' }
        ]
      }
    })

    if (!store && !storeUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Fetch all colors from the Color table
    const allColors = await prismadb.color.findMany({
      where: { storeId },
      select: { name: true }
    })

    // Fetch all sizes from the Size table  
    const allSizes = await prismadb.size.findMany({
      where: { storeId },
      select: { name: true }
    })

    // Fetch all categories from the Category table
    const allCategories = await prismadb.category.findMany({
      where: { storeId },
      select: { name: true, type: true }
    })

    // Extract materials, styles, and genders from Category table based on type
    const categoryMaterials = allCategories
      .filter(cat => cat.type === 'material')
      .map(cat => cat.name)
    
    const categoryStyles = allCategories
      .filter(cat => cat.type === 'style')
      .map(cat => cat.name)
    
    const categoryGenders = allCategories
      .filter(cat => cat.type === 'gender')
      .map(cat => cat.name)

    // Get distinct values from products for additional options
    const products = await prismadb.product.findMany({
      where: { 
        storeId,
        isDeleted: false 
      },
      select: {
        categoryData: true,
        colorDetails: true,
        sizeDetails: true,
        gender: true,
        createdByName: true
      }
    })

    // Extract materials and styles from categoryData
    const materialsSet = new Set<string>()
    const stylesSet = new Set<string>()
    const gendersSet = new Set<string>()
    const creatorsSet = new Set<string>()
    const productColorsSet = new Set<string>()
    const productSizesSet = new Set<string>()

    products.forEach(product => {
      // Extract materials and styles from categoryData
      if (product.categoryData && typeof product.categoryData === 'object') {
        const categoryData = product.categoryData as any
        if (categoryData.material) materialsSet.add(categoryData.material)
        if (categoryData.style) stylesSet.add(categoryData.style)
      }

      // Extract genders
      if (product.gender) gendersSet.add(product.gender)

      // Extract creators
      if (product.createdByName) creatorsSet.add(product.createdByName)

      // Extract colors from colorDetails
      if (product.colorDetails) {
        try {
          let colors = []
          if (typeof product.colorDetails === 'string') {
            colors = JSON.parse(product.colorDetails)
          } else if (Array.isArray(product.colorDetails)) {
            colors = product.colorDetails
          }
          colors.forEach((color: any) => {
            if (color.name) productColorsSet.add(color.name)
          })
        } catch (error) {
          // Ignore parsing errors
        }
      }

      // Extract sizes from sizeDetails
      if (product.sizeDetails) {
        try {
          let sizes = []
          if (typeof product.sizeDetails === 'string') {
            sizes = JSON.parse(product.sizeDetails)
          } else if (Array.isArray(product.sizeDetails)) {
            sizes = product.sizeDetails
          }
          sizes.forEach((size: any) => {
            if (size.name) productSizesSet.add(size.name)
          })
        } catch (error) {
          // Ignore parsing errors
        }
      }
    })

    // Combine database colors with product colors
    const combinedColors = new Set([
      ...allColors.map(c => c.name),
      ...Array.from(productColorsSet)
    ])

    // Combine database sizes with product sizes
    const combinedSizes = new Set([
      ...allSizes.map(s => s.name),
      ...Array.from(productSizesSet)
    ])

    // Create categories by combining materials and styles
    const combinedCategories = new Set<string>()
    
    // Add categories from the Category table
    allCategories.forEach(category => {
      combinedCategories.add(category.name)
    })

    // Add categories from product categoryData (material + style combinations)
    Array.from(materialsSet).forEach(material => {
      Array.from(stylesSet).forEach(style => {
        combinedCategories.add(`${material} ${style}`.trim())
      })
    })

    // Also add individual materials and styles as categories
    Array.from(materialsSet).forEach(material => {
      combinedCategories.add(material)
    })
    Array.from(stylesSet).forEach(style => {
      combinedCategories.add(style)
    })

    // Combine materials from Category table and products
    const allMaterials = new Set([
      ...categoryMaterials,
      ...Array.from(materialsSet)
    ])

    // Combine styles from Category table and products
    const allStyles = new Set([
      ...categoryStyles,
      ...Array.from(stylesSet)
    ])

    // Combine genders from Category table and products
    const allGenders = new Set([
      ...categoryGenders,
      ...Array.from(gendersSet)
    ])

    return NextResponse.json({
      categories: Array.from(combinedCategories).sort(),
      colors: Array.from(combinedColors).sort(),
      sizes: Array.from(combinedSizes).sort(),
      materials: Array.from(allMaterials).sort(),
      styles: Array.from(allStyles).sort(),
      genders: Array.from(allGenders).sort(),
      creators: Array.from(creatorsSet).sort()
    })

  } catch (error) {
    console.error("[FILTER_OPTIONS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}