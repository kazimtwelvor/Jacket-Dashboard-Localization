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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // You can replace "*" with a specific origin for security
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return new NextResponse(
        JSON.stringify({ error: validationResult.error.errors[0].message }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const { email, password, storeId, recaptchaToken } = validationResult.data

    const storeExists = await prismadb.store.findUnique({
      where: { id: storeId },
    })

    if (!storeExists) {
      return new NextResponse(JSON.stringify({ error: "Store not found" }), {
        status: 404,
        headers: corsHeaders,
      })
    }

    const recaptchaSettings = await prismadb.recaptchaSettings.findFirst({
      where: { storeId, enabled: true, enabledOnLogin: true },
    })

    if (recaptchaSettings) {
      if (!recaptchaToken) {
        return new NextResponse(
          JSON.stringify({ error: "reCAPTCHA verification required" }),
          { status: 400, headers: corsHeaders }
        )
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
        return new NextResponse(
          JSON.stringify({ error: "reCAPTCHA verification failed" }),
          { status: 400, headers: corsHeaders }
        )
      }
    }

    const user = await prismadb.storeUser.findFirst({
      where: {
        email,
        storeId,
      },
    })

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined")
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        storeId: user.storeId,
      },
      jwtSecret,
      { expiresIn: "7d" }
    )

    const { passwordHash, resetToken, verifyToken, ...safeUser } = user

    try {
      await prismadb.storeUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })
    } catch (updateError) {
    }

    return new NextResponse(
      JSON.stringify({
        user: safeUser,
        token,
        message: "Login successful",
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
