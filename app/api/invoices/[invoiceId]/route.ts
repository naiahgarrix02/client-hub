import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/utils";


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

        const body = await request.json();

        const { status, dueDate, description } = body;

        const updatedInvoice = await prisma.invoice.update({
          data: {
            status,
            dueDate,
            description
          },
          where: {
            id: invoiceId,
          },
        });

        return NextResponse.json(updatedInvoice, {status: 200})
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