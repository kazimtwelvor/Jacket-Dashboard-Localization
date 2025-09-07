import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; contactFormId: string } }
) {
  try {
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