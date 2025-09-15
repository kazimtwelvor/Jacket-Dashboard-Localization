import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; contactFormId: string } }
) {
  try {
    const permissionCheck = await checkApiPermission(params.storeId, Permission.VIEW_FORMS, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view forms.", { status: 403 })
    }
 
    const contactForm = await prismadb.contactForm.findUnique({
      where: {
        id: params.contactFormId,
        storeId: params.storeId,
      },
    })

    if (!contactForm) {
      return new NextResponse("Contact form not found", { status: 404 })
    }

    return NextResponse.json(contactForm)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; contactFormId: string } }
) {
  try {
    const body = await req.json()

    const { firstName, lastName, email, subject, message, agreeToPrivacyPolicy, status } = body

    const permissionCheck = await checkApiPermission(params.storeId, Permission.EDIT_FORMS, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit forms.", { status: 403 })
    }

    const contactForm = await prismadb.contactForm.update({
      where: {
        id: params.contactFormId,
        storeId: params.storeId,
      },
      data: {
        firstName,
        lastName,
        email,
        subject,
        message,
        agreeToPrivacyPolicy,
        status,
      },
    })

    return NextResponse.json(contactForm)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; contactFormId: string } }
) {
  try {
    const permissionCheck = await checkApiPermission(params.storeId, Permission.DELETE_FORMS, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete forms.", { status: 403 })
    }

    const contactForm = await prismadb.contactForm.delete({
      where: {
        id: params.contactFormId,
        storeId: params.storeId,
      },
    })

    return NextResponse.json(contactForm)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}