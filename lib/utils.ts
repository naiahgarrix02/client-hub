import { clsx, type ClassValue } from "clsx";
import { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { jwtVerify } from "jose";

export type InvoiceItemInput = {
  description: string;
  quantity: number;
  rate: number;
};

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

export function calculateInvoiceTotals(items: InvoiceItemInput[]) {
  const updatedInvoiceTotals = items.map((item) =>({...item, amount: item.quantity * item.rate}));
  const newTotalAmount = items.reduce(
      (acc: number, item) =>
        acc + item.quantity * item.rate,
      0,
    );

    return { items: updatedInvoiceTotals, totalAmount: newTotalAmount }
}