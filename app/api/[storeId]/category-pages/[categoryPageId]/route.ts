import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: Request,
  { params }: { params: { categoryPageId: string } }
) {
  try {
    const { categoryPageId } = params;
    
    if (!categoryPageId) {
      return new NextResponse("Category page ID is required", { status: 400 })
    }

    const categoryPage = await prismadb.categoryPage.findUnique({
      where: {
        id: categoryPageId,
      },
    })
    
    if (!categoryPage) {
      return new NextResponse("Category page not found", { status: 404 })
    }
    
    // Check if this is for a template by looking at the URL query params
    const { searchParams } = new URL(req.url)
    const forTemplate = searchParams.get("forTemplate") === "true"
    
    // If this is for a template, ensure we're not returning a regular category
    if (forTemplate) {
      const name = categoryPage.name.toLowerCase();
      // Check if this is a common material, style, or gender type
      const commonMaterials = ["cotton", "polyester", "wool", "silk", "linen", "denim", "leather", "cashmere", "nylon", "spandex"];
      const commonStyles = ["bomber", "puffer", "varsity", "letterman", "biker", "aviator", "quilted", "blazer", "cropped", "long coat", "casual", "formal"];
      const commonGenders = ["men", "women", "unisex", "boys", "girls"];
      
      if (commonMaterials.includes(name) || commonStyles.includes(name) || commonGenders.includes(name)) {
        return new NextResponse("This is a regular category, not a category page", { status: 400 })
      }
    }
    
    // Log keyword data
    console.log('Category Page Keywords:', {
      focusKeyword: categoryPage.focusKeyword,
      supportingKeywords: categoryPage.supportingKeywords
    });
    
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
    console.log("[CATEGORY_PAGE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryPageId: string } }
) {
  try {
    // Extract params early to ensure they're available
    const { storeId, categoryPageId } = params;
    
    const { userId } = await auth()
    const body = await req.json()
    
    console.log('[CATEGORY_PAGE_PATCH] Request body:', JSON.stringify(body, null, 2))
    console.log('[CATEGORY_PAGE_PATCH] Status field:', body.status)
    console.log('[CATEGORY_PAGE_PATCH] IsPublished field:', body.isPublished)
    
    // Debug logs
    console.log('PATCH request received')
    console.log('User ID:', userId)
    console.log('Store ID:', storeId)
    console.log('Category Page ID:', categoryPageId)
    console.log('Keyword Data:', {
      focusKeyword: body.focusKeyword,
      supportingKeywords: body.supportingKeywords
    })
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    // Skip permission checks - allow any authenticated user

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
      seoTitle,
      seoDescription,
      focusKeyword,
      supportingKeywords,
      categoryContent,
      status,
      isPublished,
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription,
      canonicalUrl,
      indexPage,
      followLinks,
      enableSchema,
      schemaType,
      customSchema,
    } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    if (!categoryPageId) {
      return new NextResponse("Category page ID is required", { status: 400 })
    }

    // Check if slug is unique for this store (excluding current category page)
    const existingCategoryPage = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        slug,
        NOT: {
          id: categoryPageId,
        },
      },
    })

    if (existingCategoryPage) {
      return new NextResponse("Slug already exists", { status: 400 })
    }

    // Use the provided imageUrl
    const finalImageUrl = imageUrl || "";

    const updateData = {
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
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      focusKeyword: focusKeyword || "",
      supportingKeywords: supportingKeywords || [],
      ogTitle: ogTitle || "",
      ogDescription: ogDescription || "",
      twitterTitle: twitterTitle || "",
      twitterDescription: twitterDescription || "",
      canonicalUrl: canonicalUrl || "",
      indexPage: indexPage !== false,
      followLinks: followLinks !== false,
      enableSchema: enableSchema !== false,
      schemaType: schemaType || "CollectionPage",
      customSchema: customSchema ? (typeof customSchema === 'string' ? customSchema : JSON.stringify(customSchema)) : null,
      status: status || "DRAFT",
    }

    if (categoryContent) {
      updateData.categoryContent = categoryContent
    }

    // Handle status and isPublished fields
    if (status !== undefined && (status === "PUBLISHED" || status === "DRAFT")) {
      updateData.status = status
      updateData.isPublished = status === "PUBLISHED"
      if (status === "PUBLISHED") {
        updateData.publishedAt = new Date()
      }
    } else if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      updateData.status = isPublished ? "PUBLISHED" : "DRAFT"
      if (isPublished) {
        updateData.publishedAt = new Date()
      }
    } else {
      // Default to DRAFT if no status is provided
      updateData.status = "DRAFT"
    }

    const categoryPage = await prismadb.categoryPage.update({
      where: {
        id: categoryPageId,
      },
      data: updateData,
    });
    
    // Check if this is for a template by looking at the URL query params
    const { searchParams } = new URL(req.url)
    const forTemplate = searchParams.get("forTemplate") === "true"
    
    // Add currentCategory field with the same id, name, and imageUrl
    const responseData = {
      ...categoryPage,
      currentCategory: {
        categoryId: categoryPage.id,
        categoryName: categoryPage.name,
        imageUrl: categoryPage.imageUrl || ""
      }
    };
    
    // If this is for a template, ensure we're not returning a regular category
    if (forTemplate) {
      const name = categoryPage.name.toLowerCase();
      // Check if this is a common material, style, or gender type
      const commonMaterials = ["cotton", "polyester", "wool", "silk", "linen", "denim", "leather", "cashmere", "nylon", "spandex"];
      const commonStyles = ["bomber", "puffer", "varsity", "letterman", "biker", "aviator", "quilted", "blazer", "cropped", "long coat", "casual", "formal"];
      const commonGenders = ["men", "women", "unisex", "boys", "girls"];
      
      if (commonMaterials.includes(name) || commonStyles.includes(name) || commonGenders.includes(name)) {
        return new NextResponse("This is a regular category, not a category page", { status: 400 })
      }
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.log("[CATEGORY_PAGE_PATCH] Error:", error)
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryPageId: string } }
) {
  try {
    const { storeId, categoryPageId } = params;
    const { userId } = await auth()

    // Debug logs
    console.log('DELETE request received')
    console.log('User ID:', userId)
    console.log('Store ID:', storeId)
    console.log('Category Page ID:', categoryPageId)

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!categoryPageId) {
      return new NextResponse("Category page ID is required", { status: 400 })
    }

    // Skip permission checks - allow any authenticated user

    const categoryPage = await prismadb.categoryPage.delete({
      where: {
        id: categoryPageId,
      },
    })

    return NextResponse.json(categoryPage)
  } catch (error) {
    console.log("[CATEGORY_PAGE_DELETE] Error:", error)
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
}