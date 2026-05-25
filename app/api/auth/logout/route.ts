import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    (await cookies()).delete("auth_token");

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
