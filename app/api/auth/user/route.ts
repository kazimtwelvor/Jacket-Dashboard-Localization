import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { verifyJWT } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Get the token from authorization header
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify JWT token
    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Retrieve user from database
    const user = await prismadb.storeUser.findUnique({
      where: { id: payload.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive information before sending response
    const { passwordHash, resetToken, verifyToken, ...safeUser } = user

    return NextResponse.json({
      user: safeUser,
    })
  } catch (error) {
    console.error("[GET_USER_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    // Get the token from authorization header
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify JWT token
    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await req.json()
    const { name, phone, address, city, state, zipCode, country } = body

    // Update user profile
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

    // Remove sensitive information before sending response
    const { passwordHash, resetToken, verifyToken, ...safeUser } = updatedUser

    return NextResponse.json({
      user: safeUser,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("[UPDATE_USER_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
