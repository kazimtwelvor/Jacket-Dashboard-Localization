import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { ProductForm } from "./components/product-form"
import type { Product, Image } from "../types"
import { StoreNameProvider } from "./components/store-name-provider"

interface ProductWithImages extends Omit<Product, "images"> {
  images: {
    image: {
      id: string
      url: string
    }
    order: number
  }[]
}

interface ProductPageProps {
  params: {
    productId: string
    storeId: string
  }
}

const ProductPage: React.FC<ProductPageProps> = async ({ params }) => {
  const { userId } = await auth()
  // Extract storeId and productId as strings to avoid the NextJS dynamic API warning
  const storeId = params.storeId as string
  const productId = params.productId as string

  if (!userId) {
    redirect("/sign-in")
  }

  // Modified query to include all needed fields
  const product = await prismadb.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      storeId: true,
      categoryData: true,
      name: true,
      price: true,
      isFeatured: true,
      isArchived: true,
      isPublished: true,
      colorDetails: true,
      sizeDetails: true,
      images: {
        include: {
          image: {
            select: {
              id: true,
              url: true,
              altText: true,
              title: true,
              caption: true,
              description: true,
              excludeFromSitemap: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
      store: true,
      sku: true,
      stockStatus: true,
      description: true,
      salePrice: true,
      specifications: true,
      tags: true,
      gender: true,
      colorLinks: true,
      metaTitle: true,
      metaDescription: true,
      slug: true,
      noIndex: true,
      brandName: true,
      ratingValue: true,
      reviewCount: true,
      purchaseNote: true,
      productType: true,
      createdAt: true,
      updatedAt: true,
      keywords: true,
      schema: true,
      relatedProducts: true,
    },
  })

  // Transform the data structure to match what the form expects
  const productWithImages: Product | null = product
    ? {
        id: product.id,
        storeId: product.storeId,
        categoryData: product.categoryData,
        name: product.name,
        price: product.price.toString(),
        isFeatured: product.isFeatured,
        isArchived: product.isArchived,
        isPublished: !product.isArchived,
        colorId: product.colorDetails
          ? typeof product.colorDetails === "object" && product.colorDetails !== null && "id" in product.colorDetails
            ? (product.colorDetails as any).id
            : ""
          : "",
        colorDetails: product.colorDetails,
        images: (product as any).images.map(
          (pi: any): Image => ({
            id: pi.image.id,
            url: pi.image.url,
            altText: pi.image.altText || "",
            title: pi.image.title || "",
            caption: pi.image.caption || "",
            description: pi.image.description || "",
            excludeFromSitemap: pi.image.excludeFromSitemap || false,
          }),
        ),
        sku: product.sku,
        stockStatus: product.stockStatus || undefined,
        description: product.description || undefined,
        salePrice: product.salePrice?.toString() || undefined,
        specifications: product.specifications?.toString(),
        tags: product.tags || [],
        gender: product.gender || undefined,
        keywords: product.keywords || [],
        // Fix for colorLinks - properly handle different formats
        colorLinks: (() => {
          try {
            if (!product.colorLinks) return undefined

            if (typeof product.colorLinks === "object" && product.colorLinks !== null) {
              console.log("Using colorLinks as object:", product.colorLinks)
              return product.colorLinks
            }

            if (typeof product.colorLinks === "string") {
              // Check if it's the problematic "[object Object]" string
              if (product.colorLinks === "[object Object]") {
                console.log("Found '[object Object]' string in page.tsx, using empty object")
                return {}
              }

              try {
                const parsed = JSON.parse(product.colorLinks)
                console.log("Parsed colorLinks in page.tsx:", parsed)
                return parsed
              } catch (e) {
                console.error("Error parsing colorLinks in page.tsx:", e)
                return {}
              }
            }

            return {}
          } catch (error) {
            console.error("Error processing colorLinks in page.tsx:", error)
            return {}
          }
        })(),
        metaTitle: product.metaTitle || undefined,
        metaDescription: product.metaDescription || undefined,
        slug: product.slug || undefined,
        noIndex: product.noIndex || undefined,
        brandName: product.brandName || undefined,
        ratingValue: product.ratingValue || undefined,
        reviewCount: product.reviewCount || undefined,
        purchaseNote: product.purchaseNote || undefined,
        productType: product.productType || undefined,
        seoScore: undefined,
        schema: product.schema || undefined,
        sizeDetails: product.sizeDetails,
        relatedProducts: product.relatedProducts || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }
    : null

  if (product && product.schema) {
    console.log("Schema data from database:", product.schema)
  }

  const categories = await prismadb.category.findMany({
    where: {
      storeId: storeId,
    },
  })

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: storeId,
    },
  })

  const colors = await prismadb.color.findMany({
    where: {
      storeId: storeId,
    },
  })

  return (
    <StoreNameProvider storeId={storeId}>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ProductForm initialData={productWithImages} categories={categories} sizes={sizes} colors={colors} />
        </div>
      </div>
    </StoreNameProvider>
  )
}

export default ProductPage
