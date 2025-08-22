import { NextResponse } from "next/server"
import { verifyRecaptcha, verifyRecaptchaV3 } from "@/lib/recaptcha"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 })
    }

    // Get reCAPTCHA settings from database
    const recaptchaSettings = await prismadb.recaptchaSettings.findFirst({
      where: {
        storeId,
      },
    })

    if (!recaptchaSettings) {
      return NextResponse.json({ success: false, error: "reCAPTCHA is not configured" }, { status: 400 })
    }

    if (!recaptchaSettings.enabled) {
      return NextResponse.json({ success: true })
    }

    // Verify the token based on the reCAPTCHA version
    let isValid = false
    if (recaptchaSettings.version === "v3") {
      isValid = await verifyRecaptchaV3(token, recaptchaSettings.secretKey, recaptchaSettings.threshold || 0.5)
    } else {
      isValid = await verifyRecaptcha(token, recaptchaSettings.secretKey)
    }

    return NextResponse.json({ success: isValid })
  } catch (error) {
    console.error("[RECAPTCHA_VERIFY_ERROR]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
