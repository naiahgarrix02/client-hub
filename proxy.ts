import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  try {
    const cookie = request.cookies.get("auth_token");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    if (!cookie) {
      return NextResponse.json(
        { error: "User Authentication required" },
        { status: 401 },
      );
    }

    await jwtVerify(cookie.value, secret);

    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verificaton failed" }, { status: 401 });
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
