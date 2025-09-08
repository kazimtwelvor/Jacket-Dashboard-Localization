import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import jwt from "jsonwebtoken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Change this to a specific domain for production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name, X-Store-Id",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return new NextResponse("Unauthorized - No token provided", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return new NextResponse("JWT secret not configured", {
        status: 500,
        headers: corsHeaders,
      });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (error) {
      return new NextResponse("Invalid token", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userEmail = payload.email;
    if (!userEmail) {
      return new NextResponse("User email not found in token", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const orders = await prismadb.order.findMany({
      where: {
        customerEmail: userEmail,
        ...(storeId && { storeId }),
        ...(status && { status: status as any }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        store: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedOrders = orders.map(order => ({
      ...order,
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      orderItems: order.orderItems.map(item => ({
        ...item,
        price: Number(item.price),
        originalPrice: Number(item.originalPrice),
        discountAmount: Number(item.discountAmount),
        total: Number(item.total),
      })),
    }));

    return NextResponse.json({ orders: serializedOrders }, { headers: corsHeaders });
  } catch (error) {
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}