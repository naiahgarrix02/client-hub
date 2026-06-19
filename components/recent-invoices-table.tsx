import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RecentInvoicesProps = {
  invoices: {
    invoiceNumber: string;
    issueDate: string;
    client: {
      name: string;
    };
    dueDate: string;
    status: string;
  }[];
};


export function RecentInvoicesTable({ invoices }: RecentInvoicesProps) {

    const invoiceData = invoices.map((invoice) => (
      <TableRow key={invoice.invoiceNumber}>
        <TableCell>{invoice.invoiceNumber}</TableCell>
        <TableCell>{invoice.issueDate}</TableCell>
        <TableCell>{invoice.client.name}</TableCell>
        <TableCell>{invoice.dueDate}</TableCell>
        <TableCell>{invoice.status}</TableCell>
      </TableRow>
    ));
    
    return(
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {invoiceData}
            </TableBody>
        </Table>
    )
}