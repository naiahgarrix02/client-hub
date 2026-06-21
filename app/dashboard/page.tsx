import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import prisma from "@/lib/prisma"


import { redirect } from "next/navigation"
import { RecentInvoicesTable } from "@/components/recent-invoices-table"
import { getAuthenticatedUserId } from "@/lib/auth"

export default async function Page() {
  const userId = await getAuthenticatedUserId();

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

  const userDetails = await prisma.user.findUnique({
    where: {
      id: userId
    }, select: {
      name: true,
      email: true
    }
  })

  if(!userDetails) {
    redirect('/login');
    return;
  }

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
      <AppSidebar user={{ name: userDetails.name ?? "User", email: userDetails.email ?? "" }} variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
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
              <RecentInvoicesTable invoices={recentInvoices} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
