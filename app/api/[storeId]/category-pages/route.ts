import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { userId } = await auth()
    const body = await req.json()
    
    console.log('[CATEGORY_PAGES_POST] Request body:', JSON.stringify(body, null, 2))
    console.log('[CATEGORY_PAGES_POST] Status field:', body.status)
    console.log('[CATEGORY_PAGES_POST] IsPublished field:', body.isPublished)
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    // Skip permission checks - allow any authenticated user
    // Just create the category page

    const {
      name,
      slug,
      apiSlug,
      description,
      imageUrl,
      bannerImageUrl,
      materials,
      styles,
      colors,
      genders,
      collars,
      cuffs,
      closures,
      pockets,
      isBest,
      seoTitle,
      seoDescription,
      focusKeyword,
      supportingKeywords,
      categoryContent,
      status,
      isPublished,
    } = body
    


    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    // Check if slug is unique for this store
    const existingCategoryPage = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        slug,
      },
    })

    if (existingCategoryPage) {
      return new NextResponse("Slug already exists", { status: 400 })
    }

    // Use the provided imageUrl
    const finalImageUrl = imageUrl || "";

    const categoryPage = await prismadb.categoryPage.create({
      data: {
        name,
        slug,
        apiSlug: apiSlug || "",
        description: description || "",
        imageUrl: finalImageUrl,
        bannerImageUrl: bannerImageUrl || "",
        materials: materials || [],
        styles: styles || [],
        colors: colors || [],
        genders: genders || [],
        collars: collars || [],
        cuffs: cuffs || [],
        closures: closures || [],
        pockets: pockets || [],
        isBest: isBest || false,
        seoTitle: seoTitle || "",
        seoDescription: seoDescription || "",
        focusKeyword: focusKeyword || "",
        supportingKeywords: supportingKeywords || [],
        categoryContent: categoryContent || null,
        status: (status === "PUBLISHED" || status === "DRAFT") ? status : "DRAFT",
        isPublished: status === "PUBLISHED" || isPublished === true,
        publishedAt: (status === "PUBLISHED" || isPublished === true) ? new Date() : null,
        storeId: storeId,
      },
    })
    
    // Add currentCategory field with the same id, name, and imageUrl
    const responseData = {
      ...categoryPage,
      currentCategory: {
        categoryId: categoryPage.id,
        categoryName: categoryPage.name,
        imageUrl: categoryPage.imageUrl || ""
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.log("[CATEGORY_PAGES_POST] Error:", error)
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    
    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const filterType = searchParams.get("filterType")
    const forTemplate = searchParams.get("forTemplate") === "true"
    const isBest = searchParams.get("isBest")

    let whereClause: any = {
      storeId: storeId,
    }

    if (slug) {
      whereClause.slug = slug
    }
    
    // Add isBest filter if provided
    if (isBest === "true") {
      whereClause.isBest = true
    } else if (isBest === "false") {
      whereClause.isBest = { not: true }
    }
    
    // Add status filter - default to published for public API calls
    const status = searchParams.get("status")
    const includeAll = searchParams.get("includeAll") === "true"
    
    if (!includeAll) {
      // Default behavior: only return published pages
      whereClause.status = "PUBLISHED"
    } else if (status && (status === "DRAFT" || status === "PUBLISHED")) {
      whereClause.status = status
    }

    // Get all category pages
    const categoryPages = await prismadb.categoryPage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Log keyword data for each category page
    categoryPages.forEach(page => {
      console.log(`Category Page "${page.name}" Keywords:`, {
        focusKeyword: page.focusKeyword,
        supportingKeywords: page.supportingKeywords
      })
    })
    
    // For the "Other Categories" tab in templates, we only want actual category pages
    // from the database, not regular filter options like styles, gender, and material
    
    // Add currentCategory field to each category page
    const responseData = categoryPages.map(page => ({
      ...page,
      currentCategory: {
        categoryId: page.id,
        categoryName: page.name,
        imageUrl: page.imageUrl || ""
      }
    }))

    // If this is for a template, we need to ensure we're not returning any regular categories
    if (forTemplate) {
      // Filter out any entries that might be regular categories (styles, gender, material)
      // This is a safety check in case someone manually added these as category pages
      const filteredData = responseData.filter(item => {
        const name = item.name.toLowerCase();
        // Filter out common material types
        if (["cotton", "polyester", "wool", "silk", "linen", "denim", "leather", "cashmere", "nylon", "spandex"].includes(name)) {
          return false;
        }
        // Filter out common style types
        if (["bomber", "puffer", "varsity", "letterman", "biker", "aviator", "quilted", "blazer", "cropped", "long coat", "casual", "formal"].includes(name)) {
          return false;
        }
        // Filter out common gender types
        if (["men", "women", "unisex", "boys", "girls"].includes(name)) {
          return false;
        }
        return true;
      });
      
      return NextResponse.json(filteredData);
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.log("[CATEGORY_PAGES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}