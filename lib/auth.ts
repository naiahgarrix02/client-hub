import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("auth_token");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (!cookie) {
    redirect("/login");
    return;
  }

  const userVerificaiton = await jwtVerify(cookie.value, secret);

  const rawId = userVerificaiton.payload.id;

  if (typeof rawId !== "string") {
    redirect("/login");
    return;
  }

  const userId = rawId;

  return userId;
}
