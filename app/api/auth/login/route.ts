import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import bcrypt from "bcrypt"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { verifyRecaptcha, verifyRecaptchaV3 } from "@/lib/recaptcha"

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  storeId: z.string().uuid("Invalid store ID"),
  recaptchaToken: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Login request received:", { ...body, password: "[REDACTED]" })

    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      console.log("Login validation failed:", validationResult.error.errors)
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { email, password, storeId, recaptchaToken } = validationResult.data

    // Check if store exists
    const storeExists = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    if (!storeExists) {
      console.log(`Store not found: ${storeId}`)
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Check if reCAPTCHA is enabled for this store
    const recaptchaSettings = await prismadb.recaptchaSettings.findFirst({
      where: { storeId, enabled: true, enabledOnLogin: true },
    })

    console.log("reCAPTCHA settings:", recaptchaSettings)

    // Verify reCAPTCHA if enabled
    if (recaptchaSettings && recaptchaSettings.enabled && recaptchaSettings.enabledOnLogin) {
      console.log("reCAPTCHA verification required")

      if (!recaptchaToken) {
        console.log("No reCAPTCHA token provided")
        return NextResponse.json({ error: "reCAPTCHA verification required" }, { status: 400 })
      }

      console.log(`reCAPTCHA token received, length: ${recaptchaToken.length}`)
      console.log(`reCAPTCHA version: ${recaptchaSettings.version}`)
      console.log(`Secret key available: ${!!recaptchaSettings.secretKey}`)

      let isVerified = false
      if (recaptchaSettings.version === "v3") {
        console.log(`Verifying reCAPTCHA v3 token with threshold: ${recaptchaSettings.threshold || 0.5}`)
        isVerified = await verifyRecaptchaV3(
          recaptchaToken,
          recaptchaSettings.secretKey,
          recaptchaSettings.threshold || 0.5,
        )
      } else {
        console.log("Verifying reCAPTCHA v2 token")
        isVerified = await verifyRecaptcha(recaptchaToken, recaptchaSettings.secretKey)
      }

      console.log(`reCAPTCHA verification result: ${isVerified ? "success" : "failed"}`)

      if (!isVerified) {
        return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 })
      }
    }

    // Find user by email in this store
    const user = await prismadb.storeUser.findFirst({
      where: {
        email,
        storeId,
      },
    })

    if (!user) {
      console.log(`User not found: ${email} in store ${storeId}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      console.log(`Password mismatch for user: ${email}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is not defined")
      throw new Error("JWT_SECRET environment variable is not defined")
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        storeId: user.storeId,
      },
      jwtSecret,
      { expiresIn: "7d" },
    )

    // Remove sensitive information before sending response
    const { passwordHash, resetToken, verifyToken, ...safeUser } = user

    console.log(`Login successful for user: ${email}`)

    // Update last login
    try {
      await prismadb.storeUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })
    } catch (updateError) {
      console.error("Error updating last login:", updateError)
      // Continue even if this fails
    }

    return NextResponse.json({
      user: safeUser,
      token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("[LOGIN_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
