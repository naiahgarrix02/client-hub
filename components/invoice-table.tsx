"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash, Edit } from "lucide-react";
import Dropdown, { DropdownItem } from "./dropdown";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const statusOptions = [
  { name: "Draft" },
  { name: "Sent" },
  { name: "Paid" },
  { name: "Overdue" },
];


type Invoice = {
    id: string
    invoiceNumber: string
    description: string
    client: {
      id: string
      name: string
    }
    status: string
    issueDate: Date
    project: {
      id: string
      name: string
    }
    dueDate: Date | null
    totalAmount: number
}


export function InvoiceRow({invoice} : {invoice: Invoice}) {
  return (
    <TableRow>
      <TableCell className="p-5">{invoice.invoiceNumber}</TableCell>
      <TableCell className="p-5">{invoice.description}</TableCell>
      <TableCell className="p-5">{invoice.client.name}</TableCell>
      <TableCell className="p-5">
        {" "}
        {new Date(invoice.issueDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="p-5">{invoice.status}</TableCell>
      <TableCell className="p-5">
        {" "}
        {new Date(invoice.dueDate ?? "").toLocaleDateString()}
      </TableCell>
      <TableCell className="p-5">{invoice.totalAmount}</TableCell>
      <TableCell className="p-5">
        <Button onClick={() => {}} className="mr-2">
          <Trash />
        </Button>
        <Button onClick={() => {}}>
          <Edit />
        </Button>
      </TableCell>
    </TableRow>
  );
};


export function InvoiceList({ invoice } : { invoice: Invoice[] }) {  
  const invoiceList = invoice.map((item) => (
    <InvoiceRow key={item.id} invoice={item} />
  ));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="p-5">Invoice Number</TableHead>
          <TableHead className="p-5">Description</TableHead>
          <TableHead className="p-5">Client</TableHead>
          <TableHead className="p-5">Issue Date</TableHead>
          <TableHead className="p-5">Status</TableHead>
          <TableHead className="p-5">Due Date</TableHead>
          <TableHead className="p-5">Total Amount (GHS)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{invoiceList}</TableBody>
    </Table>
  );
}