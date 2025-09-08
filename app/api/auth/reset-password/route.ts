import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import bcrypt from "bcrypt"
import { z } from "zod"

const resetPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeId: z.string().uuid("Invalid store ID"),
})

function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*") // Or replace * with your frontend domain
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type")
  return response
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return setCorsHeaders(
        NextResponse.json({ error: validationResult.error.errors }, { status: 400 })
      )
    }

    const { email, password, storeId } = validationResult.data

    const user = await prismadb.storeUser.findFirst({
      where: {
        email,
        storeId,
      },
    })

    if (!user) {
      return setCorsHeaders(
        NextResponse.json({ error: "User not found" }, { status: 400 })
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prismadb.storeUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
      },
    })

    return setCorsHeaders(
      NextResponse.json({
        message: "Password has been reset successfully",
      })
    )
  } catch (error) {
    return setCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    )
  }
}

export function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return setCorsHeaders(response)
}
