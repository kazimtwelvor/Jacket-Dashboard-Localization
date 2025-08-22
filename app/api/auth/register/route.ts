import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import bcrypt from "bcrypt"
import { z } from "zod"
import { verifyRecaptcha, verifyRecaptchaV3 } from "@/lib/recaptcha"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeId: z.string().uuid("Invalid store ID"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  recaptchaToken: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 })
    }

    const { name, email, password, storeId, phone, address, city, state, zipCode, country, recaptchaToken } =
      validationResult.data

    // Check if store exists
    const storeExists = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    if (!storeExists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Check if reCAPTCHA is enabled for this store
    const recaptchaSettings = await prismadb.recaptchaSettings.findFirst({
      where: { storeId, enabled: true, enabledOnRegister: true },
    })

    // Verify reCAPTCHA if enabled
    if (recaptchaSettings && recaptchaSettings.enabled && recaptchaSettings.enabledOnRegister) {
      if (!recaptchaToken) {
        return NextResponse.json({ error: "reCAPTCHA verification required" }, { status: 400 })
      }

      let isVerified = false
      if (recaptchaSettings.version === "v3") {
        isVerified = await verifyRecaptchaV3(
          recaptchaToken,
          recaptchaSettings.secretKey,
          recaptchaSettings.threshold || 0.5,
        )
      } else {
        isVerified = await verifyRecaptcha(recaptchaToken, recaptchaSettings.secretKey)
      }

      if (!isVerified) {
        return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 })
      }
    }

    // Check if email already exists for this store
    const existingUser = await prismadb.storeUser.findFirst({
      where: {
        email,
        storeId,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = await prismadb.storeUser.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        storeId,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        isVerified: true, // Automatically verify the user
      },
    })

    // Remove sensitive information before sending response
    const { passwordHash, resetToken, ...safeUser } = newUser

    // Try to send welcome email, but don't block registration if it fails
    try {
      // Use Promise.race with a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timed out")), 2000),
      )
    } catch (emailError) {
      console.error("[WELCOME_EMAIL_ERROR]", emailError)
      // Continue with registration even if email fails
    }

    return NextResponse.json(
      {
        user: safeUser,
        message: "User registered successfully.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
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
