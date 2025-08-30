import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const contactForms = await prismadb.contactForm.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(contactForms)
  } catch (error) {
    console.log("[CONTACT_FORMS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { firstName, lastName, email, subject, message, agreeToPrivacyPolicy, status } = body

    if (!firstName || !lastName || !email || !subject || !message) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const contactForm = await prismadb.contactForm.create({
      data: {
        storeId: params.storeId,
        firstName,
        lastName,
        email,
        subject,
        message,
        agreeToPrivacyPolicy: agreeToPrivacyPolicy || false,
        status: status || "PENDING",
      },
    })

    return NextResponse.json(contactForm)
  } catch (error) {
    console.log("[CONTACT_FORMS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}