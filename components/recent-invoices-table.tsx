import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RecentInvoicesProps = {
  invoices: {
    invoiceNumber: string;
    issueDate: Date;
    client: {
      name: string;
    };
    dueDate: Date | null;
    status: string;
    totalAmount: string;
  }[];
};


export function RecentInvoicesTable({ invoices }: RecentInvoicesProps) {


    const invoiceData = invoices.map((invoice) => (
      <TableRow key={invoice.invoiceNumber}>
        <TableCell className="px-2 py-4">{invoice.invoiceNumber}</TableCell>
        <TableCell className="px-2 py-4">
          {new Date(invoice.issueDate).toLocaleDateString()}
        </TableCell>
        <TableCell className="px-2 py-4">{invoice.client.name}</TableCell>
        <TableCell className="px-2 py-4">
          {invoice.dueDate
            ? new Date(invoice.dueDate).toLocaleDateString()
            : "N/A"}
        </TableCell>
        <TableCell className="px-2 py-4">{invoice.status}</TableCell>
        <TableCell className="px-2 py-4">{invoice.totalAmount}</TableCell>
      </TableRow>
    ));
    
    return (
      <Table>
        <TableHeader >
          <TableRow>
            <TableHead className="px-2 py-4">Invoice Number</TableHead>
            <TableHead className="px-2 py-4">Issue Date</TableHead>
            <TableHead className="px-2 py-4">Client Name</TableHead>
            <TableHead className="px-2 py-4">Due Date</TableHead>
            <TableHead className="px-2 py-4">Status</TableHead>
            <TableHead className="px-2 py-4">Total Amount (GHS)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{invoiceData}</TableBody>
      </Table>
    );
}