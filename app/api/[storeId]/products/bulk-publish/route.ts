import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.EDIT_PRODUCTS, 'POST')
    
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to manage products.", { status: 403 })
    }

    const unpublishedProducts = await prismadb.product.updateMany({
      where: {
        storeId: storeId,
        isPublished: false,
      },
      data: {
        isPublished: true,
        isArchived: false,
      },
    })

    const archivedProducts = await prismadb.product.updateMany({
      where: {
        storeId: storeId,
        isArchived: true,
      },
      data: {
        isPublished: true,
        isArchived: false,
      },
    })

    const totalUpdated = unpublishedProducts.count + archivedProducts.count

    return NextResponse.json({ 
      success: true, 
      message: `Successfully published ${totalUpdated} products`,
      count: totalUpdated,
      details: {
        unpublished: unpublishedProducts.count,
        unarchived: archivedProducts.count
      }
    })
  } catch (error) {
    console.error("Bulk publish error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
