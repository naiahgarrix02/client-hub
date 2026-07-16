import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, calculateInvoiceTotals } from "@/lib/utils";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const result = await authenticateUser(request);
    const { invoiceId } = await params

    if (!result) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 401 },
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: { invoiceItem: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Inovice not found" }, { status: 400 });
    }

    if (invoice?.userId !== result) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    return NextResponse.json(invoice, {status: 200})
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
    try {
        const result = await authenticateUser(request);
        const { invoiceId } = await params;

        if(!result){
           return NextResponse.json(
             { error: "Verification failed" },
             { status: 401 },
           ); 
        }
        

        const invoice = await prisma.invoice.findUnique({
            where: {
                id: invoiceId
            }
        }) 

        if (!invoice) {
        return NextResponse.json({ error: "Inovice not found" }, { status: 400 });
        }

        if (invoice?.userId !== result) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (invoice?.status === "Paid") {
        return NextResponse.json({ error: "Conflict" }, { status: 409 });
        }

        const body = await request.json();

        const { status, dueDate, description, items } = body;

        if (items) {
          const { items: itemsWithAmount, totalAmount } =
            calculateInvoiceTotals(items);
          const updated = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status,
              dueDate: new Date(dueDate),
              description,
              totalAmount,
              invoiceItem: {
                deleteMany: {},
                createMany: { data: itemsWithAmount },
              },
            },
          });
          return NextResponse.json(updated, { status: 200 });
        } else {
          const updated = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status, dueDate: new Date(dueDate), description },
          });
          return NextResponse.json(updated, { status: 200 });
        }

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        ) 
    }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
    try {
        const result = await authenticateUser(request);
        const { invoiceId } = await params;

        if (!result) {
          return NextResponse.json(
            { error: "Verification failed" },
            { status: 401 },
          );
        }

        const invoice = await prisma.invoice.findUnique({
          where: {
            id: invoiceId,
          },
        }); 

        if (!invoice) {
          return NextResponse.json(
            { error: "Invoice not found" },
            { status: 400 },
          );
        }

        if (invoice?.userId !== result) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const deletedInvoice = await prisma.invoice.delete({
          where: {
            id: invoiceId,
          },
        });
    
       return NextResponse.json(
         { message: "Invoice Successfully Deleted", deletedInvoice },
         { status: 200 },
       );

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        )
    }
}