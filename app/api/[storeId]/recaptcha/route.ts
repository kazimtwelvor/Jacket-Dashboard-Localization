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
    console.log("[RECAPTCHA_GET]", error)
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

    // Check if the store exists and user has access
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Create new reCAPTCHA settings
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
    console.log("[RECAPTCHA_POST]", error)
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

    // Check if the store exists and user has access
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Find existing settings or create new ones
    const existingSettings = await prismadb.recaptchaSettings.findFirst({
      where: {
        storeId: params.storeId,
      },
    })

    if (existingSettings) {
      // Update existing settings
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
      // Create new settings if none exist
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
    console.log("[RECAPTCHA_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
