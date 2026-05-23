import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      omit: { password: false },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (!match) {
      return NextResponse.json(
        { error: "Incorrect Password" },
        { status: 401 },
      );
    }

    const payload = { id: existingUser.id };
    const secret_key = process.env["JWT_SECRET"];

    if (!secret_key) throw new Error("JWT_SECRET is not defined");

    const token = jwt.sign(payload, secret_key, { expiresIn: 3600 });
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
