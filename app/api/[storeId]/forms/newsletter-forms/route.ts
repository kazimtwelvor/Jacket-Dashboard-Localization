import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const newsletterForms = await prismadb.newsletterForm.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(newsletterForms)
  } catch (error) {
    console.log("[NEWSLETTER_FORMS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json()

    const { email, status } = body

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    const newsletterForm = await prismadb.newsletterForm.create({
      data: {
        storeId: params.storeId,
        email,
        status: status || "ACTIVE",
      },
    })

    return NextResponse.json(newsletterForm)
  } catch (error) {
    console.log("[NEWSLETTER_FORMS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}