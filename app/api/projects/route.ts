import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, status, startDate, endDate, notes, clientId } =
      body;

    const result = await authenticateUser(request);

    if (!result) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 401 },
      );
    }

    if (!name || !description || !clientId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newProject = await prisma.project.create({
      data: {
        clientId: clientId,
        userId: result.toString(),
        name,
        description,
        notes,
        startDate,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await authenticateUser(request);

    if (!result) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 401 },
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: result.toString(),
      },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
