import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  try {
    const cookie = request.cookies.get("auth_token");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    if (!cookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    await jwtVerify(cookie.value, secret);

    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/user/:path*",
    "/client/:path*",
    "/invoices/:path*",
  ],
};
