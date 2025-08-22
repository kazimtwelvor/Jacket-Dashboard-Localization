import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the first store owned by this user
    const store = await prismadb.store.findFirst({
      where: {
        userId,
      },
    })

    if (!store) {
      return new NextResponse("No store found", { status: 404 })
    }

    // Get the first billboard in this store
    const billboard = await prismadb.billboard.findFirst({
      where: {
        storeId: store.id,
      },
    })

    let billboardId = billboard?.id

    // If no billboard exists, create one
    if (!billboardId) {
      const newBillboard = await prismadb.billboard.create({
        data: {
          label: "Test Billboard",
          imageUrl: "https://via.placeholder.com/1920x1080?text=Test+Billboard",
          storeId: store.id,
        },
      })
      billboardId = newBillboard.id
    }

    // Try to create a test category
    const category = await prismadb.category.create({
      data: {
        name: "Test Category",
        slug: "test-category",
        billboardId: billboardId,
        storeId: store.id,
        type: "material", // Assuming 'type' is a field in your Category model
      },
    })

    return NextResponse.json({
      success: true,
      message: "Test category created successfully",
      category,
    })
  } catch (error) {
    console.error("Error in test-category route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test category",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
