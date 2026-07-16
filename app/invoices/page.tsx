import prisma from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getAuthenticatedUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InvoiceList } from "@/components/invoice-table";



export default async function Page() {
  const userId = await getAuthenticatedUserId();

  const userDetails = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (!userDetails) {
    redirect("/login");
    return;
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    }, include: {client: true}
  });

  const invoice = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    }, include: {
      client: true, 
      project: true
    }
  });

  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      userId: true,
    },
    where : {
      userId: userId
    }
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        user={{
          name: userDetails.name ?? "User",
          email: userDetails.email ?? "",
        }}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader title="Invoices" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 pl-8">
              <InvoiceList invoice={invoice} clients={clients} projects={projects} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
