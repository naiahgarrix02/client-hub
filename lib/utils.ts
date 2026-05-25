import { clsx, type ClassValue } from "clsx";
import { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { jwtVerify } from "jose";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function authenticateUser(request: NextRequest) {
  try {
    const cookie = request.cookies.get("auth_token");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    if (!cookie) {
      return null;
    }

    const userVerificaiton = await jwtVerify(cookie.value, secret);

    const userId = userVerificaiton.payload.id;

    return userId;
  } catch (error) {
    console.error(error);
    return null;
  }
}
