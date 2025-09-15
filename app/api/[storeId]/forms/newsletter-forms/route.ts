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

    const newsletterForms = await prismadb.newsletterForm.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(newsletterForms, {
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

    const { email, status } = body

    if (!email) {
      return new NextResponse("Email is required", { 
        status: 400,
        headers: corsHeaders(),
      })
    }


    const newsletterForm = await prismadb.newsletterForm.create({
      data: {
        storeId: params.storeId,
        email,
        status: status || "ACTIVE",
      },
    })

    return NextResponse.json(newsletterForm, {
      headers: corsHeaders(),
    })
  } catch (error) {
    return new NextResponse("Internal error", { 
      status: 500,
      headers: corsHeaders(),
    })
  }
}