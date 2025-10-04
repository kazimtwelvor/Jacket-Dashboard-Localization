import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { storeId, productId } = params

    const parentProduct = await prismadb.product.findUnique({
      where: {
        id: productId,
        storeId: storeId,
        isParentProduct: true
      },
      select: {
        id: true,
        colorLinks: true,
        colorDetails: true
      }
    })

    if (!parentProduct) {
      return new NextResponse("Parent product not found or not a parent", { status: 404 })
    }

    let parentColorLinks = {}
    let parentColorDetails = []

    if (parentProduct.colorLinks) {
      if (typeof parentProduct.colorLinks === 'string') {
        try {
          parentColorLinks = JSON.parse(parentProduct.colorLinks)
        } catch (e) {
          parentColorLinks = {}
        }
      } else {
        parentColorLinks = parentProduct.colorLinks
      }
    }

    if (parentProduct.colorDetails) {
      if (typeof parentProduct.colorDetails === 'string') {
        try {
          parentColorDetails = JSON.parse(parentProduct.colorDetails)
        } catch (e) {
          parentColorDetails = []
        }
      } else {
        parentColorDetails = parentProduct.colorDetails as any[]
      }
    }

    // Find all child products (products that have this product as parent)
    const childProducts = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        parentProductId: productId,
      },
      select: {
        id: true,
        name: true,
        sku: true
      }
    })

    if (childProducts.length === 0) {
      return NextResponse.json({
        message: "No child products found",
        updatedCount: 0,
        childProducts: []
      })
    }

    const updatePromises = childProducts.map(child => 
      prismadb.product.update({
        where: { id: child.id },
        data: {
          colorLinks: parentColorLinks as any,
          colorDetails: parentColorDetails as any
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: "Child products updated successfully",
      updatedCount: childProducts.length,
      childProducts: childProducts.map(child => ({
        id: child.id,
        name: child.name,
        sku: child.sku
      }))
    })

  } catch (error) {
    console.error('Error updating child products:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
