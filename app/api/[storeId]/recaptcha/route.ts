import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const recaptchaSettings = await prismadb.recaptchaSettings.findFirst({
      where: {
        storeId: params.storeId,
      },
    })

    return NextResponse.json(recaptchaSettings)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await  auth()
    const body = await req.json()

    const { siteKey, secretKey, enabled, version, threshold, enabledOnLogin, enabledOnRegister } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!siteKey) {
      return new NextResponse("Site key is required", { status: 400 })
    }

    if (!secretKey) {
      return new NextResponse("Secret key is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const recaptchaSettings = await prismadb.recaptchaSettings.create({
      data: {
        storeId: params.storeId,
        siteKey,
        secretKey,
        enabled: enabled || false,
        version: version || "v3",
        threshold: threshold || 0.5,
        enabledOnLogin: enabledOnLogin ?? true,
        enabledOnRegister: enabledOnRegister ?? true,
      },
    })

    return NextResponse.json(recaptchaSettings)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { siteKey, secretKey, enabled, version, threshold, enabledOnLogin, enabledOnRegister } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!siteKey) {
      return new NextResponse("Site key is required", { status: 400 })
    }

    if (!secretKey) {
      return new NextResponse("Secret key is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const existingSettings = await prismadb.recaptchaSettings.findFirst({
      where: {
        storeId: params.storeId,
      },
    })

    if (existingSettings) {
      const updatedSettings = await prismadb.recaptchaSettings.update({
        where: {
          id: existingSettings.id,
        },
        data: {
          siteKey,
          secretKey,
          enabled: enabled ?? false,
          version: version || "v3",
          threshold: threshold || 0.5,
          enabledOnLogin: enabledOnLogin ?? true,
          enabledOnRegister: enabledOnRegister ?? true,
        },
      })
      return NextResponse.json(updatedSettings)
    } else {
      const newSettings = await prismadb.recaptchaSettings.create({
        data: {
          storeId: params.storeId,
          siteKey,
          secretKey,
          enabled: enabled ?? false,
          version: version || "v3",
          threshold: threshold || 0.5,
          enabledOnLogin: enabledOnLogin ?? true,
          enabledOnRegister: enabledOnRegister ?? true,
        },
      })
      return NextResponse.json(newSettings)
    }
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
