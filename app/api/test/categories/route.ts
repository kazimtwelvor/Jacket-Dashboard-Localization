import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET() {
  try {
    const categoryPages = await prismadb.categoryPage.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        apiSlug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    const allCategories = categoryPages.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      type: "category-page",
      apiSlug: cat.apiSlug || "",
    }))

    return NextResponse.json({
      success: true,
      categories: allCategories,
      count: allCategories.length,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch categories",
        categories: [],
        count: 0,
      },
      { status: 500 }
    )
  }
}

