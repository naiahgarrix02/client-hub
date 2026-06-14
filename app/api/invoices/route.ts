import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { clientId, projectId, issueDate, dueDate, items, description } = body;

    const result = await authenticateUser(request);
    if (!result) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 401 },
      );
    }

    if(!clientId || !description || !items || items.length == 0) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
    }

    const invoiceCount = await prisma.invoice.count({
        where: {
            userId: result.toString(),
        }
    })

    const newInvoiceCount = invoiceCount + 1;
    const invoiceNumber = newInvoiceCount.toString().padStart(4, '0');

    const newInvoiceNumber = "INV-" + invoiceNumber;

    const totalAmount  = items.reduce((acc: number, item: {quantity: number, rate: number}) => acc + (item.quantity * item.rate), 0);

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: newInvoiceNumber,
        clientId: clientId,
        projectId,
        userId: result.toString(),
        description,
        issueDate,
        dueDate,
        totalAmount,
        invoiceItem: {
          create: items
        },
      },
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "InternaL Server Error" },
      { status: 500 },
    );
  }
}
