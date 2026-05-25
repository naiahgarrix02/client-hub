import { authenticateUser } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } },
) {
  try {
    const result = await authenticateUser(request);

    if (!result) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 401 },
      );
    }

    const client = await prisma.client.findUnique({
      where: {
        id: params.clientId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 400 });
    }

    if (!client?.userId === result) {
      return null;
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } },
) {
  try {
    const result = await authenticateUser(request);

    if (!result) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 401 },
      );
    }

    const updatedClient = await prisma.client.update({
      data: {},
      where: { id: params.clientId },
    });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { clientId: string } },
) {
  try {
    const result = await authenticateUser(request);

    if (!result) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 401 },
      );
    }

    const deletedClient = await prisma.client.delete({
      where: { id: params.clientId },
    });

    return NextResponse.json(
      { message: "Client Successfully Deleted", deletedClient },
      { status: 500 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
