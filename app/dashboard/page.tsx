import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import prisma from "@/lib/prisma"

import data from "./data.json"
import { redirect } from "next/navigation"
import { RecentInvoicesTable } from "@/components/recent-invoices-table"

export default async function Page() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("auth_token");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if(!cookie) {
    redirect('/login')
  }

  const userVerificaiton = await jwtVerify(cookie.value, secret);

  const rawId = userVerificaiton.payload.id;

  if(typeof rawId !== "string") {
    redirect('/login');
  }

  const userId = rawId

  const totalClients = await prisma.client.count({
    where: {
      userId: userId,
    },
  });

  const activeProjects = await prisma.project.count({
    where: {
      userId: userId,
      status: "active",
    },
  });

  const unpaidInvoices = await prisma.invoice.count({
    where: {
      userId: userId,
      status: { not: "paid" },
    },
  });

  const totalRevenueResult = await prisma.invoice.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      userId: userId,
      status: "paid",
    },
  });

  const totalRevenue = totalRevenueResult._sum.totalAmount ?? 0;

  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      userId: userId
    },
    include: {
      client: true
    }
  })

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                totalRevenue={totalRevenue}
                totalClients={totalClients}
                unpaidInvoices={unpaidInvoices}
                activeProjects={activeProjects}
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
