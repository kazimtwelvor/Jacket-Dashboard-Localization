import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; newsletterFormId: string } }
) {
  try {
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