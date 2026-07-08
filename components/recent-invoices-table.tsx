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
        <TableCell className="p-5">{invoice.invoiceNumber}</TableCell>
        <TableCell className="p-5">
          {new Date(invoice.issueDate).toLocaleDateString()}
        </TableCell>
        <TableCell className="p-5">{invoice.client.name}</TableCell>
        <TableCell className="p-5">
          {invoice.dueDate
            ? new Date(invoice.dueDate).toLocaleDateString()
            : "N/A"}
        </TableCell>
        <TableCell className="p-5">{invoice.status}</TableCell>
        <TableCell className="p-5">{invoice.totalAmount}</TableCell>
      </TableRow>
    ));
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-5">Invoice Number</TableHead>
            <TableHead className="p-5">Issue Date</TableHead>
            <TableHead className="p-5">Client Name</TableHead>
            <TableHead className="p-5">Due Date</TableHead>
            <TableHead className="p-5">Status</TableHead>
            <TableHead className="p-5">Total Amount (GHS)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{invoiceData}</TableBody>
      </Table>
    );
}