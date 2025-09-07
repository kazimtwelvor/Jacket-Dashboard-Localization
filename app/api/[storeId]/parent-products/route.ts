import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        isParentProduct: true,
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            sku: {
              contains: search,
              mode: "insensitive"
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        images: {
          take: 1,
          include: {
            image: {
              select: {
                url: true
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        }
      },
      take: 10
    })

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      image: product.images[0]?.image?.url || null
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}