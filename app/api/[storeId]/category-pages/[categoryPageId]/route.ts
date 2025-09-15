import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; categoryPageId: string } }
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

    const { searchParams } = new URL(req.url)
    const forTemplate = searchParams.get("forTemplate") === "true"

    if (forTemplate) {
      const name = categoryPage.name.toLowerCase();
      const commonMaterials = ["cotton", "polyester", "wool", "silk", "linen", "denim", "leather", "cashmere", "nylon", "spandex"];
      const commonStyles = ["bomber", "puffer", "varsity", "letterman", "biker", "aviator", "quilted", "blazer", "cropped", "long coat", "casual", "formal"];
      const commonGenders = ["men", "women", "unisex", "boys", "girls"];
      if (commonMaterials.includes(name) || commonStyles.includes(name) || commonGenders.includes(name)) {
        return new NextResponse("This is a regular category, not a category page", { status: 400 })
      }
    }


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
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryPageId: string } }
) {
  try {
    const { storeId, categoryPageId } = params;

    const { userId } = await auth()
    const body = await req.json()


    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.EDIT_CATEGORIES, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit category pages.", { status: 403 })
    }

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

    const existingCategoryPageBySlug = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        slug,
        NOT: {
          id: categoryPageId,
        },
      },
    })

    if (existingCategoryPageBySlug) {
      return new NextResponse("Slug already exists", { status: 400 })
    }

    const trimmedName = name.trim()
    const existingCategoryPageByName = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        },
        NOT: {
          id: categoryPageId,
        },
      },
    })


    if (existingCategoryPageByName) {
      return new NextResponse("Name already exists", { status: 400 })
    }

    const finalImageUrl = imageUrl || "";

    const updateData: any = {
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
      updateData.status = "DRAFT"
    }

    const categoryPage = await prismadb.categoryPage.update({
      where: {
        id: categoryPageId,
      },
      data: updateData,
    });

    const { searchParams } = new URL(req.url)
    const forTemplate = searchParams.get("forTemplate") === "true"

    const responseData = {
      ...categoryPage,
      currentCategory: {
        categoryId: categoryPage.id,
        categoryName: categoryPage.name,
        imageUrl: categoryPage.imageUrl || ""
      }
    };

    if (forTemplate) {
      const name = categoryPage.name.toLowerCase();
      const commonMaterials = ["cotton", "polyester", "wool", "silk", "linen", "denim", "leather", "cashmere", "nylon", "spandex"];
      const commonStyles = ["bomber", "puffer", "varsity", "letterman", "biker", "aviator", "quilted", "blazer", "cropped", "long coat", "casual", "formal"];
      const commonGenders = ["men", "women", "unisex", "boys", "girls"];

      if (commonMaterials.includes(name) || commonStyles.includes(name) || commonGenders.includes(name)) {
        return new NextResponse("This is a regular category, not a category page", { status: 400 })
      }
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
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

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!categoryPageId) {
      return new NextResponse("Category page ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.DELETE_CATEGORIES, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete category pages.", { status: 403 })
    }


    const categoryPage = await prismadb.categoryPage.delete({
      where: {
        id: categoryPageId,
      },
    })

    return NextResponse.json(categoryPage)
  } catch (error: any) {
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
}