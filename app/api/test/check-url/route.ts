import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    try {
      const response = await fetch(url, {
        method: "HEAD",
        cache: "no-store",
        headers: {
          "User-Agent": "FineystCategoryChecker/1.0",
        },
      })

      const responseTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        statusCode: response.status,
        ok: response.ok,
        responseTime,
        url,
      })
    } catch (error) {
      const responseTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        statusCode: 0,
        ok: false,
        responseTime,
        url,
        error: error instanceof Error ? error.message : "Failed to fetch",
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

