import prismadb from "@/lib/prismadb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return new Response("Email is required", { status: 400 })
    }

    const existingUser = await prismadb.storeUser.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
      },
      select: { id: true },
    })

    return Response.json(Boolean(existingUser))
  } catch (error) {
    console.error("[USERS_CHECK_EXISTS]", error)
    return new Response("Internal error", { status: 500 })
  }
}