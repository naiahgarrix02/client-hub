"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash, Edit } from "lucide-react";
import Dropdown from "./dropdown";

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

type Projects = {
  project: {
    id: string;
    client: {
      name: string;
    };
    name: string;
    description: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
  }[];
  clients: {
    id: string;
    name: string;
  }[];
};

export function ProjectList({project, clients}: Projects ) {
  console.log(clients)
    const [open, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [clientId, setClientId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedProject, setSelectedProject] = useState<
            Projects["project"][0] | null
          >(null);
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();
    
    const projectData = project.map((projects) => (
      <TableRow key={projects.id}>
        <TableCell className="p-5">{projects.name}</TableCell>
        <TableCell className="p-5">{projects.description}</TableCell>
        <TableCell className="p-5">{projects.status}</TableCell>
        <TableCell className="p-5">
          {new Date(projects.startDate).toLocaleDateString()}
        </TableCell>
        <TableCell className="p-5">
          {new Date(projects.endDate ?? "").toLocaleDateString()}
        </TableCell>
        <TableCell className="p-5">
          <Button onClick={() => handleDelete(projects.id)} className="mr-2">
            <Trash />
          </Button>
          <Button onClick={() => handleEdit(projects)}>
            <Edit />
          </Button>
        </TableCell>
      </TableRow>
    ));

    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();

      if (!name || !description || !status || !startDate) {
        setErrorMessage("Missing Required Fields");
        return;
      }

      fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, status, clientId, startDate, endDate }),
      })
        .then((response) =>
          response.json().then((data) => ({ ok: response.ok, data })),
        )
        .then(({ ok, data }) => {
          if (ok) {
            router.refresh();
            setIsOpen(false);

            setName("");
            setDescription("");
            setStatus("");
            setClientId("");
            setStartDate("");
            setEndDate("");

          } else {
            setErrorMessage(data.error);
          }
        });
    };

    const handleDelete = (projectId: string) => {
      fetch(`/api/projects/${projectId}`, {
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

    const handleEdit = (project: Projects["project"][0]) => {
      setSelectedProject(project);

      setName(project.name);
      setDescription(project.description ?? "");
      setStatus(project.status);
      setClientId(project.client.name)
      setStartDate(project.startDate.toISOString().split("T")[0]);
      setEndDate(
        project.endDate ? project.endDate.toISOString().split("T")[0] : "",
      );

      setIsOpen(true);
    };

    const handleUpdate = () => {
      if (!selectedProject) {
        setErrorMessage("Project not found");
        return;
      }

      fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, status, clientId ,startDate, endDate }),
      })
        .then((response) =>
          response.json().then((data) => ({ ok: response.ok, data })),
        )
        .then(({ ok, data }) => {
          if (ok) {
            router.refresh();
            setIsOpen(false);
            setSelectedProject(null);
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
              setSelectedProject(null);
              setName("");
              setDescription("");
              setStatus("");
              setStartDate("");
              setEndDate("");
              setErrorMessage("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="text-center">
              <DialogTitle>
                {selectedProject ? "Edit Project" : "Add Project"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={selectedProject ? handleUpdate : handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-sm text-balance text-muted-foreground">
                    {selectedProject
                      ? "Fill in the form below to edit a client"
                      : "Fill in the form below to add a client"}
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="name">Project Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Project-1"
                    required
                    className="bg-background"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
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
                  <FieldLabel htmlFor="startDate">Status</FieldLabel>
                  <Dropdown
                    options={["Pending", "Active", "Completed"]}
                    onSelect={(value) => setStatus(value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="startDate">Client</FieldLabel>
                  <Dropdown
                    options={clients}
                    onSelect={(value) => setClientId(value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="startDate">Start date</FieldLabel>
                  <Input
                    id="company"
                    type="date"
                    required
                    className="bg-background"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="endDate">End Date</FieldLabel>
                  <Input
                    id="notes"
                    type="date"
                    required
                    className="bg-background"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {errorMessage && (
                    <FieldDescription className="text-red-700 text-center font-medium text-[14px] border border-red-500 bg-red-200 p-2 rounded-lg">
                      {errorMessage}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <Button type="submit">
                    {selectedProject ? "Save Changes" : "Create Project"}
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
              <TableHead className="p-5">Description</TableHead>
              <TableHead className="p-5">Status</TableHead>
              <TableHead className="p-5">Client</TableHead>
              <TableHead className="p-5">Start Date</TableHead>
              <TableHead className="p-5">End Date</TableHead>
              <TableHead className="p-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{projectData}</TableBody>
        </Table>
      </div>
    );
}