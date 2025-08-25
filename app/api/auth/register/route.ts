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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace with frontend origin in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return new NextResponse(JSON.stringify({ error: validationResult.error.errors }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const {
      name,
      email,
      password,
      storeId,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      recaptchaToken,
    } = validationResult.data

    // Check if store exists
    const storeExists = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    if (!storeExists) {
      return new NextResponse(JSON.stringify({ error: "Store not found" }), {
        status: 404,
        headers: corsHeaders,
      })
    }

    // Check if reCAPTCHA is enabled
    const recaptchaSettings = await prismadb.recaptchaSettings.findFirst({
      where: { storeId, enabled: true, enabledOnRegister: true },
    })

    if (recaptchaSettings?.enabled && recaptchaSettings.enabledOnRegister) {
      if (!recaptchaToken) {
        return new NextResponse(JSON.stringify({ error: "reCAPTCHA verification required" }), {
          status: 400,
          headers: corsHeaders,
        })
      }

      let isVerified = false
      if (recaptchaSettings.version === "v3") {
        isVerified = await verifyRecaptchaV3(
          recaptchaToken,
          recaptchaSettings.secretKey,
          recaptchaSettings.threshold || 0.5
        )
      } else {
        isVerified = await verifyRecaptcha(recaptchaToken, recaptchaSettings.secretKey)
      }

      if (!isVerified) {
        return new NextResponse(JSON.stringify({ error: "reCAPTCHA verification failed" }), {
          status: 400,
          headers: corsHeaders,
        })
      }
    }

    // Check if user already exists
    const existingUser = await prismadb.storeUser.findFirst({
      where: {
        email,
        storeId,
      },
    })

    if (existingUser) {
      return new NextResponse(JSON.stringify({ error: "Email already in use" }), {
        status: 409,
        headers: corsHeaders,
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
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
        isVerified: true,
      },
    })

    // Remove sensitive fields
    const { passwordHash, resetToken, ...safeUser } = newUser

    // Send welcome email (optional)
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timed out")), 2000)
      )
      // await Promise.race([sendWelcomeEmail(), timeoutPromise]) ← if you implement email sending
    } catch (emailError) {
      console.error("[WELCOME_EMAIL_ERROR]", emailError)
    }

    return new NextResponse(
      JSON.stringify({
        user: safeUser,
        message: "User registered successfully.",
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    )
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
}

// Handle preflight CORS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
