import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import bcrypt from "bcrypt"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeId: z.string().uuid("Invalid store ID"),
})

// Helper to set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*") // Or replace * with your frontend domain
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type")
  return response
}

// Handle POST request
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return setCorsHeaders(
        NextResponse.json({ error: validationResult.error.errors }, { status: 400 })
      )
    }

    const { token, password, storeId } = validationResult.data

    // Debug logging
    console.log("[RESET_PASSWORD_DEBUG] Token:", token)
    console.log("[RESET_PASSWORD_DEBUG] StoreId:", storeId)
    console.log("[RESET_PASSWORD_DEBUG] Current time:", new Date())

    const allUsersWithTokens = await prismadb.storeUser.findMany({
      where: { storeId },
      select: { id: true, resetToken: true, resetTokenExp: true },
    })
    console.log("[RESET_PASSWORD_DEBUG] All users with tokens:", allUsersWithTokens)

    const user = await prismadb.storeUser.findFirst({
      where: {
        resetToken: token,
        storeId,
        resetTokenExp: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      const expiredUser = await prismadb.storeUser.findFirst({
        where: {
          resetToken: token,
          storeId,
        },
      })

      if (expiredUser) {
        console.log("[RESET_PASSWORD_DEBUG] Token found but expired. Exp:", expiredUser.resetTokenExp)
        return setCorsHeaders(
          NextResponse.json({ error: "Reset token has expired" }, { status: 400 })
        )
      }

      console.log("[RESET_PASSWORD_DEBUG] No user found with token")
      return setCorsHeaders(
        NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prismadb.storeUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    })

    return setCorsHeaders(
      NextResponse.json({
        message: "Password has been reset successfully",
      })
    )
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error)
    return setCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    )
  }
}

// Handle CORS preflight
export function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return setCorsHeaders(response)
}
