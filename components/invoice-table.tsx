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
import { Skeleton } from "./ui/skeleton";


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
    } | null
    dueDate: Date | null
    totalAmount: number
}

type Project = {
  id: string
  name: string
}

type Client = {
  id: string
  name: string
}

type InvoiceListProps = {
  invoice: Invoice[]
  clients: Client[]
  projects: Project[]
}

type CreateInvoiceProps = {
  clients: Client[]
  projects: Project[]
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
        <DeleteInvoiceDialog invoice={invoice} />
      </TableCell>
    </TableRow>
  );
};


export function InvoiceList({ invoice, clients, projects } :  InvoiceListProps) {  
  const invoiceList = invoice.map((item) => (
    <InvoiceRow key={item.id} invoice={item} />
  ));

  return (
    <div>
      <CreateInvoiceDialog clients={clients} projects={projects} />
      <Table className="mt-4">
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
    </div>
  );
}

export function CreateInvoiceDialog({clients, projects}:  CreateInvoiceProps) {
  const [projectId, setProjectId] = useState("")
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("Draft");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<InvoiceItemInput[]>([]);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [open, setOpen] = useState(false)
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if(!clientId || !description || !status || !issueDate || items.length === 0) {
      toast.error("Missing Required Fields");
      return;
    }

    fetch(`/api/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        clientId,
        projectId,
        status,
        issueDate,
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
          setOpen(false)

          setDescription("");
          setClientId("");
          setProjectId("");
          setStatus("Draft");
          setIssueDate("");
          setDueDate("");
          setItems([]);


          toast.success("Invoice has been successfully created!");
        } else {
          toast.error(data.error);
        }
      });
  }

  const handleAddItem = () => {
    const newItem = {
      description: "",
      quantity: 0,
      rate: 0,
    };

    setItems([...items, newItem]);
  }

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((item, i) => {
      return i !== index;
    });

    setItems(updatedItems);
  };

  const handleItemChange = (
    index: number,
    field: ItemField,
    value: ItemValue,
  ) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      } else {
        return item;
      }
    });

    setItems(updatedItems);
  };
  
  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setStatus("Draft");
            setDescription("");
            setClientId("");
            setProjectId(""); 
            setIssueDate("") 
            setDueDate("");
            setItems([]);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            Create New Invoice
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="text-center">
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-sm text-balance text-muted-foreground">
                    Fill in the form below to create an invoice
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
                  <FieldLabel htmlFor="client">Client</FieldLabel>
                    <Dropdown
                      value={clientId}
                      onValueChange={(val) => setClientId(String(val))}
                      placeholder="Select Client"
                    >
                      {clients.map((client) => (
                        <DropdownItem key={client.id} value={client.id}>
                         {client.name}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                </Field>

                <Field>
                  <FieldLabel htmlFor="project">Project</FieldLabel>
                    <Dropdown
                      value={projectId || "none"}
                      onValueChange={(val) => setProjectId(val === "none" ? "" : String(val))}
                      placeholder="Select Project"
                    >
                      <DropdownItem value="none">None</DropdownItem>
                      {projects.map((project) => (
                        <DropdownItem key={project.id} value={project.id}>
                         {project.name}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                </Field>
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Dropdown
                    key={status}
                    value={status}
                    onValueChange={(val) => setStatus(String(val))}
                    placeholder= "Draft"
                  >
                    {statusOptions.map((stat) => (
                      <DropdownItem key={stat.name} value={stat.name}>
                        {stat.name}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </Field>

                <Field>
                  <FieldLabel htmlFor="issueDate">Issue date</FieldLabel>
                  <Input
                    id="issueDate"
                    type="date"
                    required
                    className="bg-background"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
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
                <div className="pt-2 flex flex-row items-center mb-2 gap-2">
                  <hr className="grow" />
                  <h3 className="text-sm font-medium">Items</h3>
                  <hr className="grow" />
                </div>

                {items.map((item, index) => (
                  <Field key={index}>
                    <FieldLabel className="mb-2">{`Item ${index + 1}`}</FieldLabel>
                    <div className="flex flex-row gap-2 mb-2">
                      <div className="flex flex-col gap-2 mb-2">
                        <FieldLabel>Description</FieldLabel>
                        <Input
                          id={`description-${index}`}
                          type="text"
                          placeholder="Enter first item"
                          required
                          className="bg-background flex-2"
                          value={items[index].description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2 mb-2">
                        <FieldLabel>Rate</FieldLabel>
                        <Input
                          id={`rate-${index}`}
                          type="number"
                          placeholder="0"
                          required
                          className="bg-background flex-1"
                          value={items[index].rate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "rate",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2 mb-2">
                        <FieldLabel>Quantity</FieldLabel>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          placeholder="0"
                          required
                          className="bg-background flex-1"
                          value={items[index].quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleDeleteItem(index)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </Field>
                ))}
                <Button
                  type="button"
                  onClick={handleAddItem}
                  variant="secondary"
                >
                  Add Item
                </Button>
                <Field>
                  <Button type="submit">Submit</Button>
                </Field>
              </FieldGroup>
            </form>
        </DialogContent>
      </Dialog>
    </div>
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

    if (!description || !status || items.length === 0) {
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

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
              <hr className="w-full" />
              <div className="flex flex-row gap-2">
                <Skeleton className="h-9 flex-2" />
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </div>
          ) : (
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
                <div className="pt-2 flex flex-row items-center mb-2 gap-2">
                  <hr className="grow" />
                  <h3 className="text-sm font-medium">Items</h3>
                  <hr className="grow" />
                </div>
                {items.map((item, index) => (
                  <Field key={index}>
                    <FieldLabel className="mb-2">{`Item ${index + 1}`}</FieldLabel>
                    <div className="flex flex-row gap-2 mb-2">
                      <div className="flex flex-col gap-2 mb-2">
                        <FieldLabel>Description</FieldLabel>
                        <Input
                          id={`description-${index}`}
                          type="text"
                          placeholder="Enter first item"
                          required
                          className="bg-background flex-2"
                          value={items[index].description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2 mb-2">
                        <FieldLabel>Rate</FieldLabel>
                        <Input
                          id={`rate-${index}`}
                          type="number"
                          placeholder="0"
                          required
                          className="bg-background flex-1"
                          value={items[index].rate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "rate",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2 mb-2">
                        <FieldLabel>Quantity</FieldLabel>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          placeholder="0"
                          required
                          className="bg-background flex-1"
                          value={items[index].quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleDeleteItem(index)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </Field>
                ))}
                <Button
                  type="button"
                  onClick={handleAddItem}
                  variant="secondary"
                >
                  Add Item
                </Button>
                <Field>
                  <Button type="submit">Save Changes</Button>
                </Field>
              </FieldGroup>
            </form>
          )}
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
          <AlertDialogDescription>{`You are permanently deleting "${invoice.invoiceNumber}". Do you wish to proceed?`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}