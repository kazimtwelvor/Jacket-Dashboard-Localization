"use server"
import prismadb from "@/lib/prismadb"
export async function saveProductAsDraft(productId: string, storeId: string) {
  try {
    const product = await prismadb.product.update({
      where: {
        id: productId,
        storeId: storeId,
      },
      data: {
        isPublished: false,
        isArchived: false,
      },
    })
    return { success: true, product }
  } catch (error) {
    console.error("Error saving product as draft:", error)
    return { success: false, error: "Failed to save product as draft" }
  }
}

export async function publishProduct(productId: string, storeId: string) {
  try {
    const product = await prismadb.product.update({
      where: {
        id: productId,
        storeId: storeId,
      },
      data: {
        isPublished: true,
        isArchived: false,
      },
    })

    return { success: true, product }
  } catch (error) {
    console.error("Error publishing product:", error)
    return { success: false, error: "Failed to publish product" }
  }
}

export async function archiveProduct(productId: string, storeId: string) {
  try {
    const product = await prismadb.product.update({
      where: {
        id: productId,
        storeId: storeId,
      },
      data: {
        isArchived: true,
      },
    })

    return { success: true, product }
  } catch (error) {
    console.error("Error archiving product:", error)
    return { success: false, error: "Failed to archive product" }
  }
}
