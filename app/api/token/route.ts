import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { userId, sessionId, getToken } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const token = await getToken()

  return NextResponse.json({ token })
}
