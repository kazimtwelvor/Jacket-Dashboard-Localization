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

export async function GET(
  req: Request,
  { params }: { params: { countryId: string } }
) {
  try {
    const { countryId } = params

    if (!countryId) {
      return new NextResponse("Country ID is required", { status: 400 })
    }

    const country = await prismadb.country.findUnique({
      where: { id: countryId }
    })

    if (!country) {
      return new NextResponse("Country not found", { status: 404 })
    }

    return NextResponse.json(country, { headers: corsHeaders })
  } catch (error) {
    console.error('[COUNTRIES_GET_BY_ID]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { countryId: string } }
) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { countryId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!countryId) {
      return new NextResponse("Country ID is required", { status: 400 })
    }

    const { name, countryCode, currency, currencySymbol, phoneCode, timezone, isActive, sortOrder } = body

    // Check if country exists
    const existingCountry = await prismadb.country.findUnique({
      where: { id: countryId }
    })

    if (!existingCountry) {
      return new NextResponse("Country not found", { status: 404 })
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingCountry.name) {
      const countryWithSameName = await prismadb.country.findUnique({
        where: { name }
      })

      if (countryWithSameName) {
        return new NextResponse("Country with this name already exists", { status: 400 })
      }
    }

    // Check if country code is being changed and if new code already exists
    if (countryCode && countryCode !== existingCountry.countryCode) {
      const countryWithSameCode = await prismadb.country.findUnique({
        where: { countryCode: countryCode.toLowerCase() }
      })

      if (countryWithSameCode) {
        return new NextResponse("Country with this code already exists", { status: 400 })
      }
    }

    const updatedCountry = await prismadb.country.update({
      where: { id: countryId },
      data: {
        ...(name && { name }),
        ...(countryCode && { countryCode: countryCode.toLowerCase() }),
        ...(currency !== undefined && { currency: currency?.toUpperCase() }),
        ...(currencySymbol !== undefined && { currencySymbol }),
        ...(phoneCode !== undefined && { phoneCode }),
        ...(timezone !== undefined && { timezone }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json(updatedCountry, { headers: corsHeaders })
  } catch (error) {
    console.error('[COUNTRIES_PATCH]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { countryId: string } }
) {
  try {
    const { userId } = await auth()
    const { countryId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!countryId) {
      return new NextResponse("Country ID is required", { status: 400 })
    }

    // Check if country exists
    const existingCountry = await prismadb.country.findUnique({
      where: { id: countryId }
    })

    if (!existingCountry) {
      return new NextResponse("Country not found", { status: 404 })
    }

    await prismadb.country.delete({
      where: { id: countryId }
    })

    return NextResponse.json({ message: "Country deleted successfully" }, { headers: corsHeaders })
  } catch (error) {
    console.error('[COUNTRIES_DELETE]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
