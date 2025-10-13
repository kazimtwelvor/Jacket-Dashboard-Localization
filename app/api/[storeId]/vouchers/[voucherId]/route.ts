import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { voucherId: string } }
) {
  try {
    if (!params.voucherId) {
      return new NextResponse("Voucher id is required", { status: 400 });
    }

    const voucher = await prismadb.voucher.findUnique({
      where: {
        id: params.voucherId
      },
      include: {
        voucherCountries: {
          include: {
            country: true
          }
        }
      }
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.log('[VOUCHER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { voucherId: string, storeId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.voucherId) {
      return new NextResponse("Voucher id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const voucher = await prismadb.voucher.delete({
      where: {
        id: params.voucherId
      }
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.log('[VOUCHER_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { voucherId: string, storeId: string } }
) {
  try {
    const { userId } = await auth();
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

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.voucherId) {
      return new NextResponse("Voucher id is required", { status: 400 });
    }

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    if (!type) {
      return new NextResponse("Type is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    await prismadb.voucherCountry.deleteMany({
      where: { voucherId: params.voucherId }
    })

    const voucher = await prismadb.voucher.update({
      where: {
        id: params.voucherId
      },
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
        voucherCountries: {
          create: (countryIds || []).map((countryId: string) => ({
            countryId
          }))
        }
      }
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.log('[VOUCHER_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}