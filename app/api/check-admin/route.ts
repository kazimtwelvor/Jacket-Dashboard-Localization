
import { type NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { getClientIp } from "@/lib/utils"


const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS = 5
const ipRequestMap = new Map<string, { count: number; timestamp: number }>()

export async function GET(req: NextRequest) {
  try {
    const clientIp = getClientIp(await headers()) || "unknown"

    const now = Date.now()
    const requestData = ipRequestMap.get(clientIp) || { count: 0, timestamp: now }

    if (now - requestData.timestamp > RATE_LIMIT_WINDOW) {
      requestData.count = 0
      requestData.timestamp = now
    }

    requestData.count++
    ipRequestMap.set(clientIp, requestData)

    if (requestData.count > MAX_REQUESTS) {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIp}`)
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const origin = req.headers.get("origin")
    const referer = req.headers.get("referer")
    const isValidOrigin = validateOrigin(origin, referer)
    if (!isValidOrigin) {
      console.warn(`[SECURITY] Invalid origin detected: ${origin}, referer: ${referer}`)
      return NextResponse.json({ error: "Invalid request" }, { status: 403 })
    }

    const clerkRole = user.publicMetadata.role as string
    const userEmail = user.emailAddresses[0]?.emailAddress
    const superUserEmails = process.env.SUPER_USER_EMAILS?.split(",") || []
    const isEmailSuperUser = userEmail ? superUserEmails.includes(userEmail) : false

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    const isSuperAdminInDb = dbUser?.role === "SUPER_ADMIN"
    const isSuperAdmin = clerkRole === "super_admin" && (isSuperAdminInDb || isEmailSuperUser)

    if (isSuperAdmin) {
    } else {
      console.warn(`[ADMIN_ACCESS] Failed admin verification attempt for user: ${userId}`)
    }

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function validateOrigin(origin: string | null, referer: string | null): boolean {
  // Allow all origins - bypass origin validation
  return true
}
