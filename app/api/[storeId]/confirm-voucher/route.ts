import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { code, orderTotal, items } = body;

    if (!code) {
      return new NextResponse("Voucher code is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!orderTotal) {
      return new NextResponse("Order total is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const voucher = await prismadb.voucher.findFirst({
      where: {
        code,
        storeId: params.storeId,
        isActive: true,
      },
    });

    if (!voucher) {
      return NextResponse.json(
        {
          valid: false,
          message: "Invalid voucher code",
        },
        { headers: corsHeaders }
      );
    }

    if (voucher.validUntil && new Date() > voucher.validUntil) {
      return NextResponse.json(
        {
          valid: false,
          message: "Voucher has expired",
        },
        { headers: corsHeaders }
      );
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json(
        {
          valid: false,
          message: "Voucher usage limit reached",
        },
        { headers: corsHeaders }
      );
    }

    if (
      voucher.minOrderAmount &&
      orderTotal < Number(voucher.minOrderAmount)
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum order amount is $${voucher.minOrderAmount}`,
        },
        { headers: corsHeaders }
      );
    }

    let discount = 0;
    let newTotal = orderTotal;

    if (voucher.type === "PERCENTAGE") {
      discount = (orderTotal * Number(voucher.value)) / 100;
      if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
        discount = Number(voucher.maxDiscount);
      }
    } else if (voucher.type === "FIXED") {
      discount = Number(voucher.value);
    } else if (voucher.type === "BUY_X_GET_Y") {
      if (items && items.length >= Number(voucher.buyQuantity)) {
        const freeItems =
          Math.floor(items.length / Number(voucher.buyQuantity)) *
          Number(voucher.getQuantity);
        const sortedItems = items.sort((a, b) => a.price - b.price);
        discount = sortedItems
          .slice(0, freeItems)
          .reduce((sum, item) => sum + item.price, 0);
      }
    }

    newTotal = Math.max(0, orderTotal - discount);

    return NextResponse.json(
      {
        valid: true,
        discount: discount,
        newTotal: newTotal,
        message: `Voucher applied! You saved $${discount.toFixed(2)}`,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[CONFIRM_VOUCHER]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
