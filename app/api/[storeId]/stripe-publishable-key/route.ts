import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const storeId = params.storeId

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        stripePublishableKey: true,
      },
    })

    if (!store) {
      return new NextResponse("Store not found", { status: 404 })
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    return NextResponse.json({ publishableKey: store.stripePublishableKey }, { headers })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
