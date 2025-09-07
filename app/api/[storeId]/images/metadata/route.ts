import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkUserPermission, checkUserStoreAccess } from "@/lib/store-roles"

const normalizeUrl = (url: string): string => {
  let normalized = url.replace(/^https?:\/\//, "")
  normalized = normalized.replace(/^www\./, "")
  normalized = normalized.split("?")[0]
  normalized = normalized.split("#")[0]
  normalized = normalized.replace(/\/+$/, "")
  try {
    normalized = decodeURIComponent(normalized)
  } catch (e) {
  }
  return normalized
}

const extractPath = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname
  } catch (e) {
    const withoutProtocol = url.replace(/^https?:\/\//, "")
    const pathPart = withoutProtocol.split("/").slice(1).join("/")
    return "/" + pathPart
  }
}

const extractFilename = (url: string): string => {
  return url.split("/").pop() || ""
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params as { storeId: string }
    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")
    const timestamp = searchParams.get("t") // Cache-busting parameter

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    const hasAccess =
      storeByUserId ||
      (await checkUserStoreAccess(userId, storeId)) ||
      (await checkUserPermission(userId, storeId, "MANAGE_PRODUCTS"))

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    if (!url) {
      return new NextResponse("URL parameter is required", { status: 400 })
    }


    const normalizedUrl = normalizeUrl(url)
    const pathOnly = extractPath(url)
    const filename = extractFilename(url)


    const potentialMatches = await prismadb.image.findMany({
      where: {
        OR: [
          {
            url: {
              equals: url,
              mode: "insensitive",
            },
          },
          {
            url: {
              contains: normalizedUrl,
              mode: "insensitive",
            },
          },
          {
            url: {
              contains: pathOnly,
              mode: "insensitive",
            },
          },
          ...(filename.length > 5
            ? [
                {
                  url: {
                    contains: filename,
                    mode: "insensitive",
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: {
        updatedAt: "desc", // Get the most recently updated first
      },
    })


    potentialMatches.forEach((img, index) => {
     
    })

    if (potentialMatches.length === 0) {

      let storeName = "Unknown"
      try {
        const store = await prismadb.store.findUnique({
          where: {
            id: storeId,
          },
        })
        if (store) {
          storeName = store.name
        }
      } catch (error) {
      }

      const metadata = {
        name: filename || "image",
        type: url.toLowerCase().endsWith(".png")
          ? "image/png"
          : url.toLowerCase().endsWith(".jpg") || url.toLowerCase().endsWith(".jpeg")
            ? "image/jpeg"
            : url.toLowerCase().endsWith(".webp")
              ? "image/webp"
              : url.toLowerCase().endsWith(".gif")
                ? "image/gif"
                : "image/jpeg",
        size: 0,
        dimensions: { width: 800, height: 600 },
        uploadedOn: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        uploadedBy: "Unknown",
        uploadedById: "",
        uploadedTo: storeName,
        path: url,
        altText: "",
        title: "",
        caption: "",
        description: "",
        excludeFromSitemap: false,
      }

      return NextResponse.json(metadata)
    }

    const image = potentialMatches[0]
      const uploadDate = image.createdAt || new Date()
    const lastModified = image.updatedAt || uploadDate
    let uploadedBy = "Unknown"
    let uploadedById = ""

    if (image.userId) {
      try {
        const user = await prismadb.user.findUnique({
          where: {
            id: image.userId,
          },
        })

        if (user) {
          uploadedBy = user.name || user.email || "Unknown"
          uploadedById = user.id
        }
      } catch (error) {
      }
    }

    let uploadedTo = "Unknown"

    try {
      const store = await prismadb.store.findUnique({
        where: {
          id: storeId,
        },
      })

      if (store) {
        uploadedTo = store.name
      }
    } catch (error) {
    }

    let width = 800
    let height = 600

    const dimensionsMatch = url.match(/(\d+)x(\d+)/)
    if (dimensionsMatch) {
      width = Number.parseInt(dimensionsMatch[1], 10)
      height = Number.parseInt(dimensionsMatch[2], 10)
    }

    const metadata = {
      name: filename || "image",
      type: url.toLowerCase().endsWith(".png")
        ? "image/png"
        : url.toLowerCase().endsWith(".jpg") || url.toLowerCase().endsWith(".jpeg")
          ? "image/jpeg"
          : url.toLowerCase().endsWith(".webp")
            ? "image/webp"
            : url.toLowerCase().endsWith(".gif")
              ? "image/gif"
              : "image/jpeg",
      size: image.size || 0,
      dimensions: { width, height },
      uploadedOn: uploadDate.toISOString(),
      lastModified: lastModified.toISOString(),
      uploadedBy,
      uploadedById,
      uploadedTo,
      path: url,
      altText: image.altText || "",
      title: image.title || "",
      caption: image.caption || "",
      description: image.description || "",
      excludeFromSitemap: image.excludeFromSitemap || false,
      imageId: image.id,
    }


    return NextResponse.json(metadata)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
