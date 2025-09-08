
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { serializeCollection } from "@/lib/serializers";

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params;
    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    // Get all published products
    const products = await prismadb.product.findMany({
      where: {
        storeId,
        isArchived: false,
        isDeleted: false,
        noIndex: false,
      },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Get all categories of type 'material' or 'style'
    const categories = await prismadb.category.findMany({
      where: {
        storeId,
        OR: [
          { type: "material" },
          { type: "style" },
        ],
      },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
        type: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Get all category pages (PageCategory model)
    const categoryPages = await prismadb.categoryPage.findMany({
      where: { storeId },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format output
    const productList = products.map((p) => ({
      slug: p.slug,
      lastModified: p.updatedAt,
      createdAt: p.createdAt,
      type: "product",
    }));

    const categoryList = categories.map((c) => ({
      slug: c.slug,
      lastModified: c.updatedAt,
      createdAt: c.createdAt,
      type: c.type || "category",
    }));

    const categoryPageList = categoryPages.map((catPg) => ({
      slug: catPg.slug,
      lastModified: catPg.updatedAt,
      createdAt: catPg.createdAt,
      type: "categoryPage",
    }));

    return NextResponse.json({
      products: productList,
      categories: categoryList,
      categoryPages: categoryPageList,
    });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
