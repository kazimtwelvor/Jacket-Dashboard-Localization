import { NextResponse } from "next/server";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  storeId: z.string().uuid("Invalid store ID"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(JSON.stringify({ error: validationResult.error.errors }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", // You can restrict this to your frontend domain
          "Content-Type": "application/json",
        },
      });
    }

    const { email, storeId } = validationResult.data;

    return new NextResponse(
      JSON.stringify({
        message: "If your email is registered, you will receive a password reset link",
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
}


export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Change to your domain in production
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
