import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";
import jwt from "jsonwebtoken";

const googleRegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  googleId: z.string().min(1, "Google ID is required"),
  picture: z.string().optional(),
  storeId: z.string().uuid("Invalid store ID"),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validationResult = googleRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(
        JSON.stringify({ error: validationResult.error.errors[0].message }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { email, name, googleId, picture, storeId } = validationResult.data;

    const storeExists = await prismadb.store.findUnique({
      where: { id: storeId },
    });

    if (!storeExists) {
      return new NextResponse(JSON.stringify({ error: "Store not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const existingUser = await prismadb.storeUser.findFirst({
      where: {
        email,
        storeId,
      },
    });

    if (existingUser) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return new NextResponse(JSON.stringify({ error: "JWT secret not configured" }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      const token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          storeId: existingUser.storeId,
        },
        jwtSecret,
        { expiresIn: "7d" }
      );

      const { passwordHash, resetToken, verifyToken, ...safeUser } = existingUser;

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
      );
    }

    const newUser = await prismadb.storeUser.create({
      data: {
        name,
        email,
        storeId,
        isVerified: true,
      },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return new NextResponse(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        storeId: newUser.storeId,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    const { passwordHash, resetToken, verifyToken, ...safeUser } = newUser;

    return new NextResponse(
      JSON.stringify({
        user: safeUser,
        token,
        message: "User registered successfully",
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}