"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash, Edit } from "lucide-react";

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



type Clients = {
    client: {
        id: string,
        name: string,
        email: string | null,
        phone: string | null,
        company: string | null,
        notes: string | null
    }[],
}

export function ClientList({client}: Clients) {
    const [open, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [notes, setNotes] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();
    const [selectedClient, setSelectedClient] = useState<
        Clients["client"][0] | null
      >(null);

    const clientData = client.map((clients) => (
      <TableRow key={clients.id}>
        <TableCell className="p-5">{clients.name}</TableCell>
        <TableCell className="p-5">
          {clients.email ?? "N/A"}
        </TableCell>
        <TableCell className="p-5">
          {clients.phone ?? "N/A"}
        </TableCell>
        <TableCell className="p-5">
          {clients.company ?? "N/A"}
        </TableCell>
        <TableCell className="p-5">
          {clients.notes ?? "N/A"}
        </TableCell>
        <TableCell className="p-5">
          <Button onClick={() => handleDelete(clients.id)} className="mr-2">
            <Trash />
          </Button>
          <Button onClick={() => handleEdit(clients)}>
            <Edit />
          </Button>
        </TableCell>
      </TableRow>
    ));

    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      if (!name) {
        setErrorMessage("Missing Required Fields");
        return;
      }

      fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, company, notes }),
      })
        .then((response) =>
          response.json().then((data) => ({ ok: response.ok, data })),
        )
        .then(({ ok, data }) => {
          if (ok) {
            router.refresh();
            setIsOpen(false);

            setName("");
            setEmail("");
            setPhone("");
            setCompany("");
            setNotes("");


          } else {
            setErrorMessage(data.error);
          }
        });
    };

    const handleDelete = (clientId: string) => {
    
      fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })
        .then((response) =>
          response.json().then((data) => ({ ok: response.ok, data })),
        )
        .then(({ ok, data }) => {
          if (ok) {
            router.refresh();
          } else {
            setErrorMessage(data.error);
          }
        });
    };

    

    const handleEdit = (client: Clients["client"][0]) => {
      setSelectedClient(client);

      setName(client.name);
      setEmail(client.email ?? "");
      setPhone(client.phone ?? "");
      setCompany(client.company ?? "");
      setNotes(client.notes ?? "");
      
      setIsOpen(true);
    };

    const handleUpdate = () => {
  
      if(!selectedClient){
        setErrorMessage("Client not found");
        return;
      }

      fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, company, notes }),
      })
        .then((response) =>
          response.json().then((data) => ({ ok: response.ok, data })),
        )
        .then(({ ok, data }) => {

          if (ok) {

            router.refresh();
            // setIsOpen(false);
            setSelectedClient(null);

          } else {
            setErrorMessage(data.error);
          }
        });
    };

    return (
      <div>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setIsOpen(isOpen);
            if (!isOpen) {
              setSelectedClient(null);
              setName("");
              setEmail("");
              setPhone("");
              setCompany("");
              setNotes("");
              setErrorMessage("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="mb-4">Add New Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="text-center">
              <DialogTitle>
                {selectedClient ? "Edit Client" : "Add Client"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={selectedClient ? handleUpdate : handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-sm text-balance text-muted-foreground">
                    {selectedClient
                      ? "Fill in the form below to edit a client"
                      : "Fill in the form below to add a client"}
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="bg-background"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    type="text"
                    required
                    className="bg-background"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="company">Company</FieldLabel>
                  <Input
                    id="company"
                    type="text"
                    required
                    className="bg-background"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Notes</FieldLabel>
                  <Input
                    id="notes"
                    type="text"
                    required
                    className="bg-background"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  {errorMessage && (
                    <FieldDescription className="text-red-700 text-center font-medium text-[14px] border border-red-500 bg-red-200 p-2 rounded-lg">
                      {errorMessage}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <Button type="submit">
                    {selectedClient ? "Save Changes" : "Create Client"}
                  </Button>
                </Field>
                <Field></Field>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-5">Name</TableHead>
              <TableHead className="p-5">E-mail</TableHead>
              <TableHead className="p-5">Phone</TableHead>
              <TableHead className="p-5">Company</TableHead>
              <TableHead className="p-5">Notes</TableHead>
              <TableHead className="p-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{clientData}</TableBody>
        </Table>
      </div>
    );
}