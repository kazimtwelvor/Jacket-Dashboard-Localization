import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { verifyJWT } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prismadb.storeUser.findUnique({
      where: { id: payload.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { passwordHash, resetToken, verifyToken, ...safeUser } = user

    return NextResponse.json({
      user: safeUser,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, address, city, state, zipCode, country } = body

    const updatedUser = await prismadb.storeUser.update({
      where: { id: payload.id },
      data: {
        name: name,
        phone: phone,
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country,
      },
    })

    const { passwordHash, resetToken, verifyToken, ...safeUser } = updatedUser

    return NextResponse.json({
      user: safeUser,
      message: "Profile updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
