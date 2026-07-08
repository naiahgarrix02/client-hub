import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/utils";

export async function GET(request: NextRequest) {
    try {
      const result = await authenticateUser(request);

      if (!result) {
        return NextResponse.json(
          { error: "Verification failed" },
          { status: 401 },
        );
      }

      const totalClients = await prisma.client.count({
        where: {
          userId: result.toString(),
        },
      });

      const activeProjects = await prisma.project.count({
        where: {
          userId: result.toString(),
          status: "Active",
        },
      });

      const unpaidInvoices = await prisma.invoice.count({
        where: {
          userId: result.toString(),
          status: { not: "Paid" },
        },
      });

      const totalRevenueResult = await prisma.invoice.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          userId: result.toString(),
          status: "Paid",
        },
      });

      const totalRevenue = totalRevenueResult._sum.totalAmount ?? 0;

      const overview = {
        totalClients,
        activeProjects,
        unpaidInvoices,
        totalRevenue,
      };
      return NextResponse.json(overview, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {error: "Internal Server Response"},
            {status: 500}
        )
    }
}