// import { NextResponse } from "next/server"
// import { auth, currentUser } from "@clerk/nextjs/server"
// import { db } from "@/lib/db"

// export async function GET() {
//   try {
//     const { userId } = await auth()

//     if (!userId) {
//       return NextResponse.json({ isSuperAdmin: false }, { status: 401 })
//     }

//     // Get the current user from Clerk
//     const user = await currentUser()

//     if (!user) {
//       return NextResponse.json({ isSuperAdmin: false }, { status: 404 })
//     }

//     // Check if user is a super_admin in Clerk metadata
//     const clerkRole = user.publicMetadata.role as string
//     const isSuperAdmin = clerkRole === "super_admin"

//     // Check if user's email is in the SUPER_USER_EMAILS environment variable
//     const userEmail = user.emailAddresses[0]?.emailAddress
//     const superUserEmails = process.env.SUPER_USER_EMAILS?.split(",") || []
//     const isEmailSuperUser = userEmail ? superUserEmails.includes(userEmail) : false

//     // Also check the database role as a fallback
//     const dbUser = await db.user.findUnique({
//       where: { clerkId: userId },
//       select: { role: true },
//     })

//     const isSuperAdminInDb = dbUser?.role === "SUPER_ADMIN"

//     return NextResponse.json({
//       isSuperAdmin: isSuperAdmin || isSuperAdminInDb || isEmailSuperUser,
//       email: userEmail,
//       isEmailSuperUser,
//     })
//   } catch (error) {
//     console.error("[CHECK_ADMIN]", error)
//     return NextResponse.json({ isSuperAdmin: false }, { status: 500 })
//   }
// }
import { type NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { getClientIp } from "@/lib/utils" // Assuming you have or will create this utility

// Rate limiting setup
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5
const ipRequestMap = new Map<string, { count: number; timestamp: number }>()

export async function GET(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(headers()) || "unknown"

    // Apply rate limiting
    const now = Date.now()
    const requestData = ipRequestMap.get(clientIp) || { count: 0, timestamp: now }

    // Reset counter if window has passed
    if (now - requestData.timestamp > RATE_LIMIT_WINDOW) {
      requestData.count = 0
      requestData.timestamp = now
    }

    // Increment request count
    requestData.count++
    ipRequestMap.set(clientIp, requestData)

    // Check if rate limit exceeded
    if (requestData.count > MAX_REQUESTS) {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIp}`)
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // Verify authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the current user from Clerk
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify request origin
    const origin = req.headers.get("origin")
    const referer = req.headers.get("referer")
    const isValidOrigin = validateOrigin(origin, referer)
    if (!isValidOrigin) {
      console.warn(`[SECURITY] Invalid origin detected: ${origin}, referer: ${referer}`)
      return NextResponse.json({ error: "Invalid request" }, { status: 403 })
    }

    // Multi-factor verification for admin status
    const clerkRole = user.publicMetadata.role as string
    const userEmail = user.emailAddresses[0]?.emailAddress
    const superUserEmails = process.env.SUPER_USER_EMAILS?.split(",") || []
    const isEmailSuperUser = userEmail ? superUserEmails.includes(userEmail) : false

    // Database verification as an additional factor
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    const isSuperAdminInDb = dbUser?.role === "SUPER_ADMIN"
    const isSuperAdmin = clerkRole === "super_admin" && (isSuperAdminInDb || isEmailSuperUser)

    // Log admin access attempts for security auditing
    if (isSuperAdmin) {
      console.log(`[ADMIN_ACCESS] Successful admin verification for user: ${userId}`)
    } else {
      console.warn(`[ADMIN_ACCESS] Failed admin verification attempt for user: ${userId}`)
    }

    // Return minimal information
    return NextResponse.json(
      {
        isAdmin: isSuperAdmin,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Content-Security-Policy": "default-src 'self'",
          "X-Content-Type-Options": "nosniff",
        },
      },
    )
  } catch (error) {
    console.error("[CHECK_ADMIN]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to validate request origin
function validateOrigin(origin: string | null, referer: string | null): boolean {
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXTAUTH_URL, "http://localhost:3000"].filter(
    Boolean,
  )

  if (!origin && !referer) return false

  if (origin) {
    return allowedOrigins.some((allowed) => allowed && origin.startsWith(allowed))
  }

  if (referer) {
    return allowedOrigins.some((allowed) => allowed && referer.startsWith(allowed))
  }

  return false
}
