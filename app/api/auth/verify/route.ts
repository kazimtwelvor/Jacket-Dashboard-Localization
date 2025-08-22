import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { z } from "zod"

const verifySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  storeId: z.string().uuid("Invalid store ID"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = verifySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 })
    }

    const { token, storeId } = validationResult.data

    // Find user by verification token
    const user = await prismadb.storeUser.findFirst({
      where: {
        verifyToken: token,
        storeId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid verification token" }, { status: 400 })
    }

    // Mark user as verified
    await prismadb.storeUser.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
      },
    })

    return NextResponse.json({
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("[VERIFY_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
