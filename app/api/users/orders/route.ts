import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const dbUser = await prismadb.user.findFirst({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return new NextResponse("User not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const storeUser = await prismadb.storeUser.findFirst({
      where: { userId: dbUser.id },
    });

    if (!storeUser) {
      return new NextResponse("Store user not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const orders = await prismadb.order.findMany({
      where: {
        userId: storeUser.id,
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
    console.error("[USER_ORDERS_GET]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
