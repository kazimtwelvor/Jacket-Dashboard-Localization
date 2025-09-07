import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { userId } = await auth()
    const body = await req.json()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401, headers: corsHeaders })
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
      return new NextResponse("Name is required", { status: 400, headers: corsHeaders })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400, headers: corsHeaders })
    }

    const existingCategoryPageBySlug = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        slug,
      },
    })

    if (existingCategoryPageBySlug) {
      return new NextResponse("Slug already exists", { status: 400, headers: corsHeaders })
    }

    const trimmedName = name.trim()
    const existingCategoryPageByName = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        },
      },
    })



    if (existingCategoryPageByName) {
      return new NextResponse("Name already exists", { status: 400, headers: corsHeaders })
    }

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

    const responseData = {
      ...categoryPage,
      currentCategory: {
        categoryId: categoryPage.id,
        categoryName: categoryPage.name,
        imageUrl: categoryPage.imageUrl || ""
      }
    }

    return NextResponse.json(responseData, { headers: corsHeaders })
  } catch (error: any) {
    return new NextResponse(`Internal error: ${error.message}`, { status: 500, headers: corsHeaders })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400, headers: corsHeaders })
    }

    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const forTemplate = searchParams.get("forTemplate") === "true"
    const isBest = searchParams.get("isBest")

    let whereClause: any = {
      storeId: storeId,
    }

    if (slug) {
      whereClause.slug = slug
    }
    if (isBest === "true") {
      whereClause.isBest = true
    } else if (isBest === "false") {
      whereClause.isBest = { not: true }
    }

    const status = searchParams.get("status")
    const includeAll = searchParams.get("includeAll") === "true"

    if (!includeAll) {
      whereClause.status = "PUBLISHED"
    } else if (status && (status === "DRAFT" || status === "PUBLISHED")) {
      whereClause.status = status
    }
    const categoryPages = await prismadb.categoryPage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    })


    const responseData = categoryPages.map(page => ({
      ...page,
      currentCategory: {
        categoryId: page.id,
        categoryName: page.name,
        imageUrl: page.imageUrl || ""
      }
    }))

    if (forTemplate) {
      const filteredData = responseData.filter(item => {
        const name = item.name.toLowerCase();
        if (["cotton", "polyester", "wool", "silk", "linen", "denim", "leather", "cashmere", "nylon", "spandex"].includes(name)) {
          return false;
        }
        if (["bomber", "puffer", "varsity", "letterman", "biker", "aviator", "quilted", "blazer", "cropped", "long coat", "casual", "formal"].includes(name)) {
          return false;
        }
        if (["men", "women", "unisex", "boys", "girls"].includes(name)) {
          return false;
        }
        return true;
      });

      return NextResponse.json(filteredData, { headers: corsHeaders });
    }

    return NextResponse.json(responseData, { headers: corsHeaders })
  } catch (error: any) {
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders })
  }
}