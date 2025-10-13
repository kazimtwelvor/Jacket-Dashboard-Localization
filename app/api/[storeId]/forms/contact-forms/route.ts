import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

function corsHeaders() {
  const allowedOrigins = [
    process.env.FRONTEND_STORE_URL,
    'http://localhost:3000'
  ].filter(Boolean)

  return {
    'Access-Control-Allow-Origin': allowedOrigins.join(', '),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const permissionCheck = await checkApiPermission(params.storeId, Permission.VIEW_FORMS, 'GET')
    if (permissionCheck.error) {
      return new NextResponse(permissionCheck.error.body, {
        status: permissionCheck.error.status,
        headers: corsHeaders(),
      })
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view forms.", {
        status: 403,
        headers: corsHeaders(),
      })
    }

    const { searchParams } = new URL(req.url)
    const cn = searchParams.get("cn")


    let whereClause: any = {
      storeId: params.storeId,
    }

    if (cn) {
      const country = await prismadb.country.findUnique({
        where: { countryCode: cn.toLowerCase() }
      })
      if (country) {
        whereClause.countryId = country.id
      } else {
      }
    } else {
    }


    const contactForms = await prismadb.contactForm.findMany({
      where: whereClause,
      include: {
        country: true
      },
      orderBy: {
        createdAt: "desc",
      },
    })

  
    return NextResponse.json(contactForms, {
      headers: corsHeaders(),
    })
  } catch (error) {
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders(),
    })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json()

    const { firstName, lastName, email, subject, message, agreeToPrivacyPolicy, status, countryId } = body

    if (!firstName || !lastName || !email || !subject || !message) {
      return new NextResponse("Missing required fields", {
        status: 400,
        headers: corsHeaders(),
      })
    }


    const contactForm = await prismadb.contactForm.create({
      data: {
        storeId: params.storeId,
        countryId: countryId || null,
        firstName,
        lastName,
        email,
        subject,
        message,
        agreeToPrivacyPolicy: agreeToPrivacyPolicy || false,
        status: status || "PENDING",
      },
    })

    return NextResponse.json(contactForm, {
      headers: corsHeaders(),
    })
  } catch (error) {
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders(),
    })
  }
}