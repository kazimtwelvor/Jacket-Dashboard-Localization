import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    // Get the storeId from params
    const storeId = params.storeId

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    // For the store frontend, we'll allow unauthenticated access to the publishable key
    // This is safe because publishable keys are meant to be public
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

    // Add CORS headers to allow cross-origin requests from the store frontend
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    return NextResponse.json({ publishableKey: store.stripePublishableKey }, { headers })
  } catch (error) {
    console.log("[STRIPE_PUBLISHABLE_KEY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// Add OPTIONS handler for CORS preflight requests
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
