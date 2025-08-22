import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import bcrypt from "bcrypt"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeId: z.string().uuid("Invalid store ID"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 })
    }

    const { token, password, storeId } = validationResult.data

    // Find user by reset token
    const user = await prismadb.storeUser.findFirst({
      where: {
        resetToken: token,
        storeId,
        resetTokenExp: {
          gt: new Date(), // Token must not be expired
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and clear reset token
    await prismadb.storeUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    })

    return NextResponse.json({
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
