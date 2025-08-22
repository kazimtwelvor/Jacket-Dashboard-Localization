import { NextResponse } from "next/server"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  storeId: z.string().uuid("Invalid store ID"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = forgotPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 })
    }

    const { email, storeId } = validationResult.data

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      message: "If your email is registered, you will receive a password reset link",
    })
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
