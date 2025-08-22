import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkUserPermission, checkUserStoreAccess } from "@/lib/store-roles"

// Helper function to normalize URLs for comparison
const normalizeUrl = (url: string): string => {
  // Remove protocol (http://, https://)
  let normalized = url.replace(/^https?:\/\//, "")
  // Remove www.
  normalized = normalized.replace(/^www\./, "")
  // Remove query parameters
  normalized = normalized.split("?")[0]
  // Remove hash fragments
  normalized = normalized.split("#")[0]
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, "")
  // Decode URL components
  try {
    normalized = decodeURIComponent(normalized)
  } catch (e) {
    // If decoding fails, use the original normalized string
    console.log("Failed to decode URL:", e)
  }
  return normalized
}

// Helper function to extract the path part of a URL
const extractPath = (url: string): string => {
  try {
    // Try to extract just the pathname
    const urlObj = new URL(url)
    return urlObj.pathname
  } catch (e) {
    // If parsing fails, try a simpler approach
    const withoutProtocol = url.replace(/^https?:\/\//, "")
    const pathPart = withoutProtocol.split("/").slice(1).join("/")
    return "/" + pathPart
  }
}

// Helper function to extract filename from URL
const extractFilename = (url: string): string => {
  return url.split("/").pop() || ""
}

// Update the POST function to ensure metadata is properly saved
export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params as { storeId: string }

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    // Verify the user has access to this store
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    // Check if user is store owner or has appropriate permissions
    const hasAccess =
      storeByUserId ||
      (await checkUserStoreAccess(userId, storeId)) ||
      (await checkUserPermission(userId, storeId, "MANAGE_PRODUCTS"))

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Get the metadata from the request body
    const body = await req.json()

    console.log("Received metadata save request:", body)

    // Ensure we have a URL to identify the image
    if (!body.url) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    // If the imageId is provided, use it directly
    if (body.imageId) {
      console.log("Using provided imageId:", body.imageId)

      // Check if the image exists
      const existingImage = await prismadb.image.findUnique({
        where: {
          id: body.imageId,
        },
      })

      if (existingImage) {
        // Update the image with the SEO metadata
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
            // Also update the URL if it's different
            ...(body.url !== existingImage.url ? { url: body.url } : {}),
          },
        })

        console.log("Updated image metadata using imageId:", updatedImage)
        return NextResponse.json(updatedImage)
      } else {
        console.log("Image with provided imageId not found, falling back to URL search")
      }
    }

    // Normalize the URL for better matching
    const normalizedUrl = normalizeUrl(body.url)
    const pathOnly = extractPath(body.url)
    const filename = extractFilename(body.url)

    console.log("Normalized URL:", normalizedUrl)
    console.log("Path only:", pathOnly)
    console.log("Filename:", filename)

    // Get all potential matching images
    const potentialMatches = await prismadb.image.findMany({
      where: {
        OR: [
          // Exact URL match
          {
            url: {
              equals: body.url,
              mode: "insensitive",
            },
          },
          // Normalized URL match
          {
            url: {
              contains: normalizedUrl,
              mode: "insensitive",
            },
          },
          // Path match
          {
            url: {
              contains: pathOnly,
              mode: "insensitive",
            },
          },
          // Filename match (if filename is substantial)
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

    console.log(`Found ${potentialMatches.length} potential matching images`)

    // Log all potential matches for debugging
    potentialMatches.forEach((img, index) => {
      console.log(`Match ${index + 1}:`, {
        id: img.id,
        url: img.url,
        updatedAt: img.updatedAt,
      })
    })

    let image = null

    if (potentialMatches.length > 0) {
      // Use the most recently updated image
      image = potentialMatches[0]
      console.log("Using most recently updated image:", image.id)

      // Update the image with the SEO metadata
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

      console.log("Updated image metadata:", updatedImage)
      return NextResponse.json(updatedImage)
    }

    // If no matching image found, create a new one
    console.log("No matching image found, creating new record")

    // Create a new image with the current user ID
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

    console.log("Created new image record:", newImage)
    return NextResponse.json(newImage)
  } catch (error) {
    console.error("[IMAGE_METADATA_SAVE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
