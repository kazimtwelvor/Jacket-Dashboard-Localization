import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; newsletterFormId: string } }
) {
  try {
    const permissionCheck = await checkApiPermission(params.storeId, Permission.VIEW_FORMS, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view forms.", { status: 403 })
    }

    const newsletterForm = await prismadb.newsletterForm.findUnique({
      where: {
        id: params.newsletterFormId,
        storeId: params.storeId,
      },
    })

    if (!newsletterForm) {
      return new NextResponse("Newsletter form not found", { status: 404 })
    }

    return NextResponse.json(newsletterForm)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; newsletterFormId: string } }
) {
  try {
    const body = await req.json()

    const { email, status } = body

    const permissionCheck = await checkApiPermission(params.storeId, Permission.EDIT_FORMS, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit forms.", { status: 403 })
    }

    const newsletterForm = await prismadb.newsletterForm.update({
      where: {
        id: params.newsletterFormId,
        storeId: params.storeId,
      },
      data: {
        email,
        status,
      },
    })

    return NextResponse.json(newsletterForm)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; newsletterFormId: string } }
) {
  try {
    const permissionCheck = await checkApiPermission(params.storeId, Permission.DELETE_FORMS, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete forms.", { status: 403 })
    }

    const newsletterForm = await prismadb.newsletterForm.delete({
      where: {
        id: params.newsletterFormId,
        storeId: params.storeId,
      },
    })

    return NextResponse.json(newsletterForm)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}