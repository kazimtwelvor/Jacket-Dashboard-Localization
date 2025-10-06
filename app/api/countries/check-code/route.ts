import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { countryCode, countryId } = body

    if (!countryCode) {
      return new NextResponse("Country code is required", { status: 400 })
    }

    if (countryCode.length !== 2) {
      return new NextResponse("Country code must be exactly 2 characters", { status: 400 })
    }

    if (!/^[a-z]{2}$/.test(countryCode)) {
      return new NextResponse("Country code must be 2 lowercase letters", { status: 400 })
    }

    // Check if country code already exists
    const existingCountry = await prismadb.country.findUnique({
      where: { countryCode: countryCode.toLowerCase() }
    })

    // If updating an existing country, exclude it from the check
    if (existingCountry && countryId && existingCountry.id === countryId) {
      return NextResponse.json({ available: true }, { headers: corsHeaders })
    }

    if (existingCountry) {
      return NextResponse.json({ available: false, message: "Country code already exists" }, { headers: corsHeaders })
    }

    return NextResponse.json({ available: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('[COUNTRIES_CHECK_CODE]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
