import { NextResponse } from "next/server"

export async function GET() {
  // Return the frontend URL from the server environment
  const frontendUrl = process.env.FRONTEND_STORE_URL || process.env.NEXT_PUBLIC_FRONTEND_STORE_URL || null


  return NextResponse.json({
    url: frontendUrl,
    debug: {
      frontendStoreUrl: process.env.FRONTEND_STORE_URL,
      nextPublicFrontendStoreUrl: process.env.NEXT_PUBLIC_FRONTEND_STORE_URL,
    },
  })
}
