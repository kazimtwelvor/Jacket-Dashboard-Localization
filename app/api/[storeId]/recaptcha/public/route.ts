import { NextResponse } from "next/server"
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
      select: {
        siteKey: true,
        enabled: true,
        version: true,
        enabledOnLogin: true,
        enabledOnRegister: true,
      },
    })

    if (!recaptchaSettings) {
      return NextResponse.json({
        enabled: false,
        siteKey: "",
        version: "v3",
        enabledOnLogin: false,
        enabledOnRegister: false,
      })
    }

    return NextResponse.json(recaptchaSettings)
  } catch (error) {
    console.log("[RECAPTCHA_PUBLIC_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
