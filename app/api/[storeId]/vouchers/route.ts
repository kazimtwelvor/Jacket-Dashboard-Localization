import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const body = await req.json();
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      isActive,
      validUntil,
      description,
      buyQuantity,
      getQuantity,
      countryIds,
    } = body;

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    if (!type) {
      return new NextResponse("Type is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const existingVoucher = await prismadb.voucher.findFirst({
      where: { 
        code,
        storeId: params.storeId
      }
    });

    if (existingVoucher) {
      return new NextResponse("Voucher code already exists", { status: 400 });
    }

    const voucher = await prismadb.voucher.create({
      data: {
        code,
        type,
        value: value ? parseFloat(value.toString()) : 0,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount.toString()) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount.toString()) : null,
        usageLimit: usageLimit ? parseInt(usageLimit.toString()) : null,
        isActive: Boolean(isActive),
        validUntil: validUntil && validUntil !== "" && !isNaN(Date.parse(validUntil)) ? new Date(validUntil) : null,
        description: description || null,
        buyQuantity: buyQuantity ? parseInt(buyQuantity.toString()) : null,
        getQuantity: getQuantity ? parseInt(getQuantity.toString()) : null,
        storeId: params.storeId,
        voucherCountries: {
          create: (countryIds || []).map((countryId: string) => ({
            countryId
          }))
        }
      }
    });

    return NextResponse.json(voucher);
  } catch (error: any) {
    console.error('[VOUCHERS_POST] Full error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const { searchParams } = new URL(req.url)
    const cn = searchParams.get("cn") 
    const isActive = searchParams.get("isActive")
    
    let whereClause: any = {
      storeId: params.storeId,
      ...(isActive && { isActive: isActive === "true" }),
    }
    
    if (cn) {
      const country = await prismadb.country.findUnique({
        where: { countryCode: cn.toLowerCase() }
      })
      if (country) {
        whereClause.voucherCountries = {
          some: {
            countryId: country.id
          }
        }
      }
    }

    const vouchers = await prismadb.voucher.findMany({
      where: whereClause,
      include: {
        voucherCountries: {
          include: {
            country: true
          }
        }
      }
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.log('[VOUCHERS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}