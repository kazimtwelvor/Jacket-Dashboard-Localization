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

    if (!url) {
      return new NextResponse("URL parameter is required", { status: 400 })
    }

    console.log("Fetching metadata for image URL:", url)
    console.log("Cache-busting timestamp:", timestamp || "none")

    // Normalize the URL for better matching
    const normalizedUrl = normalizeUrl(url)
    const pathOnly = extractPath(url)
    const filename = extractFilename(url)

    console.log("Normalized URL:", normalizedUrl)
    console.log("Path only:", pathOnly)
    console.log("Filename:", filename)

    // Get all potential matching images with more specific matching criteria
    const potentialMatches = await prismadb.image.findMany({
      where: {
        OR: [
          // Exact URL match
          {
            url: {
              equals: url,
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
        altText: img.altText || "(empty)",
        title: img.title || "(empty)",
        caption: img.caption || "(empty)",
        description: img.description || "(empty)",
        excludeFromSitemap: img.excludeFromSitemap || false,
        updatedAt: img.updatedAt,
      })
    })

    if (potentialMatches.length === 0) {
      console.log("No matching images found in database")

      // Get the store name for the default metadata
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
        console.error("Error fetching store name:", error)
      }

      // Create a default metadata object
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

      console.log("Returning default metadata for image not found in database")
      return NextResponse.json(metadata)
    }

    // Use the most recently updated image
    const image = potentialMatches[0]
    console.log("Using most recently updated image:", image.id)
    console.log("Image SEO data:", {
      altText: image.altText || "(empty)",
      title: image.title || "(empty)",
      caption: image.caption || "(empty)",
      description: image.description || "(empty)",
      excludeFromSitemap: image.excludeFromSitemap || false,
    })

    // Get the upload date and other metadata
    const uploadDate = image.createdAt || new Date()
    const lastModified = image.updatedAt || uploadDate

    // Get the user who uploaded the image
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
        console.error("Error fetching user:", error)
      }
    }

    // Get the store name
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
      console.error("Error fetching store:", error)
    }

    // Extract dimensions from the URL or use defaults
    let width = 800
    let height = 600

    // Try to extract dimensions from the filename or URL
    const dimensionsMatch = url.match(/(\d+)x(\d+)/)
    if (dimensionsMatch) {
      width = Number.parseInt(dimensionsMatch[1], 10)
      height = Number.parseInt(dimensionsMatch[2], 10)
    }

    // Create the metadata object
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
      // SEO fields - make sure to use the actual values from the database
      altText: image.altText || "",
      title: image.title || "",
      caption: image.caption || "",
      description: image.description || "",
      excludeFromSitemap: image.excludeFromSitemap || false,
      // Include the image ID to ensure we update the same record
      imageId: image.id,
    }

    console.log("Returning metadata:", metadata)

    return NextResponse.json(metadata)
  } catch (error) {
    console.error("[IMAGE_METADATA]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
