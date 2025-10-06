import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { validateCreateCountry, validateGetCountries } from "@/validations"
import { validationResult } from "express-validator"

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

    const { name, countryCode, currency, currencySymbol, phoneCode, timezone, isActive, sortOrder } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!countryCode) {
      return new NextResponse("Country code is required", { status: 400 })
    }

    // Check if country with same name already exists
    const existingCountryByName = await prismadb.country.findUnique({
      where: { name }
    })

    if (existingCountryByName) {
      return new NextResponse("Country with this name already exists", { status: 400 })
    }

    // Check if country with same code already exists
    const existingCountryByCode = await prismadb.country.findUnique({
      where: { countryCode: countryCode.toLowerCase() }
    })

    if (existingCountryByCode) {
      return new NextResponse("Country with this code already exists", { status: 400 })
    }

    const country = await prismadb.country.create({
      data: {
        name,
        countryCode: countryCode.toLowerCase(),
        currency: currency?.toUpperCase(),
        currencySymbol,
        phoneCode,
        timezone,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(country, { headers: corsHeaders })
  } catch (error) {
    console.error('[COUNTRIES_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const isActive = searchParams.get("isActive")
    const sortBy = searchParams.get("sortBy") || "sortOrder"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { countryCode: { contains: search, mode: 'insensitive' } },
        { currency: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === "true"
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [countries, total] = await Promise.all([
      prismadb.country.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
      }),
      prismadb.country.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      countries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('[COUNTRIES_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
