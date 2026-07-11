"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash, Edit } from "lucide-react";
import { InvoiceItemInput } from "@/lib/utils";
import { toast } from "sonner";

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
import Dropdown, { DropdownItem } from "./dropdown";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { it } from "node:test";


const statusOptions = [
  { name: "Draft" },
  { name: "Sent" },
  { name: "Paid" },
  { name: "Overdue" },
];

type ItemField = "description" | "rate" | "quantity";
type ItemValue = string | number;

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
      <TableCell className="p-5 flex flex-row gap-2">
        <EditInvoiceDialog invoice={invoice} />
        <Button onClick={() => {}} className="mr-2">
          <Trash />
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
          <TableHead className="p-5">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{invoiceList}</TableBody>
    </Table>
  );
}

export function EditInvoiceDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(invoice.status);
  const [dueDate, setDueDate] = useState(
    invoice.dueDate ? invoice.dueDate.toISOString().split("T")[0] : "",
  );
  const [description, setDescription] = useState(invoice.description);
  const [items, setItems] = useState<InvoiceItemInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter()

  useEffect(() => {
    if (!open) return;

    Promise.resolve()
      .then(() => setLoading(true))
      .then(() => fetch(`/api/invoices/${invoice.id}`))
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch invoice");
        return response.json();
      })
      .then((data) => {
        const transformedItems = data.invoiceItem.map(
          (item: { quantity: number; rate: number; description: string }) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          }),
        );

        setStatus(data.status);
        setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
        setDescription(data.description);
        setItems(transformedItems);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, invoice.id]);

  const handleAddItem = () => {
    const newItem = {
      description: "",
      quantity: 0,
      rate: 0
    }
  
    setItems([...items, newItem])
  }

const handleDeleteItem = (index: number) => {
  const updatedItems = items.filter((item, i) => {
      return i !== index
  })
  
  setItems(updatedItems)
}

  const handleItemChange = (index: number, field: ItemField, value: ItemValue) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        return {...item, [field]: value}
      } else {
       return item;
      }
    });

    setItems(updatedItems);
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!description || !status || !items) {
      toast.error("Missing Required Fields");
      return
    }

    fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        description,
        dueDate,
        items,
      }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (ok) {
          router.refresh();
          setOpen(false);
          toast.success("Invoice has been successfully updated!");

        } else {
          toast.error(data.error);
        }
      });
  };

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setStatus(invoice.status);
            setDescription(invoice.description);
            setDueDate(
              invoice.dueDate
                ? invoice.dueDate.toISOString().split("T")[0]
                : "",
            );
            setItems([]);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Edit />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="text-center">
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm text-balance text-muted-foreground">
                  Fill in the form below to edit an invoice
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input
                  id="description"
                  type="text"
                  placeholder="Some text describing the project"
                  required
                  className="bg-background"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Dropdown
                  key={invoice.id}
                  value={status}
                  onValueChange={(val) => setStatus(String(val))}
                  placeholder={invoice.status}
                >
                  {statusOptions.map((stat) => (
                    <DropdownItem key={stat.name} value={stat.name}>
                      {stat.name}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </Field>
              <Field>
                <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
                <Input
                  id="dueDate"
                  type="date"
                  required
                  className="bg-background"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit">Save Changes</Button>
              </Field>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeleteInvoiceDialog({invoice}: {invoice: Invoice}) {
  const router = useRouter();

  const handleDelete = () => {
    fetch(`/api/invoices/${invoice.id}`, {
      method: "DELETE",
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (ok) {
          router.refresh();
          toast.success("Invoice has been deleted successfully!")
        } else {
          toast.error(data.error);
        }
      });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle>
            Are you sure you want to delete this invoice?
          </AlertDialogTitle>
          <AlertDialogDescription>{`You are permanently deleting ${invoice.invoiceNumber}. Do you wish to proceed?`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}