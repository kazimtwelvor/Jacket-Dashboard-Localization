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
      const parentProductId = searchParams.get("parentProductId")

      if (!parentProductId) {
        return new NextResponse("Parent Product ID is required", { status: 400 })
      }

      const product = await prismadb.product.findUnique({
        where: {
          id: parentProductId,
          storeId: params.storeId,
          isParentProduct: true
        },
        select: {
          colorLinks: true
        }
      })

      if (!product) {
        return new NextResponse("Parent product not found", { status: 404 })
      }

      let colorLinks = {}
      if (product.colorLinks) {
        if (typeof product.colorLinks === 'string') {
          try {
            colorLinks = JSON.parse(product.colorLinks)
          } catch (e) {
            colorLinks = {}
          }
        } else {
          colorLinks = product.colorLinks
        }
      }

      const colorSkus: Record<string, string> = {}
      
      for (const [color, url] of Object.entries(colorLinks)) {
        if (typeof url === 'string' && url.includes('jacket.us.com/us/product/')) {
          try {
            const slug = url.split('/us/product/')[1]
            if (slug) {
              const variantProduct = await prismadb.product.findFirst({
                where: {
                  storeId: params.storeId,
                  slug: slug,
                  isDeleted: false
                },
                select: {
                  sku: true
                }
              })
              
              if (variantProduct && variantProduct.sku) {
                colorSkus[color] = variantProduct.sku
              }
            }
          } catch (error) {
          }
        }
      }

      return NextResponse.json({ 
        colorLinks,
        colorSkus 
      })
    } catch (error) {
      return new NextResponse("Internal error", { status: 500 })
    }
  }