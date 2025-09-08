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

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params as { storeId: string }

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

    const body = await req.json()


    if (!body.url) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    if (body.imageId) {

      const existingImage = await prismadb.image.findUnique({
        where: {
          id: body.imageId,
        },
      })

      if (existingImage) {
        const updatedImage = await prismadb.image.update({
          where: {
            id: body.imageId,
          },
          data: {
            altText: body.altText,
            title: body.title,
            caption: body.caption,
            description: body.description,
            excludeFromSitemap: body.excludeFromSitemap,
            ...(body.url !== existingImage.url ? { url: body.url } : {}),
          },
        })

        return NextResponse.json(updatedImage)
      } else {
      }
    }

    const normalizedUrl = normalizeUrl(body.url)
    const pathOnly = extractPath(body.url)
    const filename = extractFilename(body.url)


    const potentialMatches = await prismadb.image.findMany({
      where: {
        OR: [
          {
            url: {
              equals: body.url,
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

    let image = null

    if (potentialMatches.length > 0) {
      image = potentialMatches[0]

      const updatedImage = await prismadb.image.update({
        where: {
          id: image.id,
        },
        data: {
          altText: body.altText,
          title: body.title,
          caption: body.caption,
          description: body.description,
          excludeFromSitemap: body.excludeFromSitemap,
        },
      })

      return NextResponse.json(updatedImage)
    }


    const newImage = await prismadb.image.create({
      data: {
        url: body.url,
        altText: body.altText || "",
        title: body.title || "",
        caption: body.caption || "",
        description: body.description || "",
        excludeFromSitemap: body.excludeFromSitemap || false,
      },
    })

    return NextResponse.json(newImage)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
