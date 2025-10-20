import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const countryId = searchParams.get('countryId')
    const blogId = searchParams.get('blogId') // For updates

    if (!slug) {
      return NextResponse.json({
        isUnique: false,
        message: "Slug is required"
      })
    }

    // Find blogs with the same slug
    const existingBlogs = await prismadb.blog.findMany({
      where: {
        storeId: params.storeId,
        content: {
          path: ["metadata", "slug"],
          equals: slug,
        },
        ...(blogId && {
          NOT: {
            id: blogId
          }
        })
      },
      include: {
        blogCountries: true
      }
    })

    // If no blogs found with this slug, it's unique
    if (existingBlogs.length === 0) {
      return NextResponse.json({
        isUnique: true,
        message: "Slug is available"
      })
    }

    // Check if any existing blog has the same country
    for (const blog of existingBlogs) {
      const existingCountryIds = blog.blogCountries.map(bc => bc.countryId)
      
      if (countryId && existingCountryIds.includes(countryId)) {
        return NextResponse.json({
          isUnique: false,
          message: "A blog with this slug already exists for the selected country"
        })
      }
    }

    return NextResponse.json({
      isUnique: true,
      message: "Slug is available"
    })

  } catch (error) {
    console.error('Error checking blog slug:', error)
    return NextResponse.json({
      isUnique: false,
      message: "Error checking slug availability"
    })
  }
}


