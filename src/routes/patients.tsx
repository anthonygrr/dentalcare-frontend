import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { Patient } from "@/types/patient.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, Pencil, Trash2, Search, Plus, Loader2 } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { toast } from "sonner";
import usePaginatedPatient from "@/hooks/usePaginatedPatient";

export const Route = createFileRoute("/patients")({
  head: () => ({ meta: [{ title: "Patients — BrightSmile" }] }),
  component: PatientsPage,
});

function getAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function PatientsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const { data: patientsResponse, isLoading } = usePaginatedPatient(page, size);

  const patients = patientsResponse?.patients ?? [];
  const totalPages = patientsResponse?.pages ?? 1;

  const [q, setQ] = useState("");
  const [view, setView] = useState<Patient | null>(null);
  const [edit, setEdit] = useState<Patient | null>(null);
  const [del, setDel] = useState<Patient | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [patients, q],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">Browse and manage patient records.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Patient
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All Patients</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-9"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Phone</TableHead>
                  {/* <TableHead>Age</TableHead> */}
                  {/* <TableHead>Address</TableHead> */}
                  {/* <TableHead>Address</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={String(p.id)}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-medium">{p.email}</TableCell>
                      {/* <TableCell>{getAge(p.email)}</TableCell> */}
                      <TableCell className="text-muted-foreground">
                        {p.birthDate.toString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.phone}</TableCell>

                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => setView(p)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDel(p)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={page + 1}
            totalPages={totalPages}
            onChange={(p) => setPage(p - 1)}
          />
        </CardContent>
      </Card>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{view?.name}</DialogTitle>
            <DialogDescription>{String(view?.id)}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Age: </span>
                {getAge(view.birthDate)}
              </p>
              <p>
                <span className="text-muted-foreground">Phone: </span>
                {view.phone}
              </p>
              <p>
                <span className="text-muted-foreground">Email: </span>
                {view.email}
              </p>
              {/* <p><span className="text-muted-foreground">Address: </span>{view.address}</p> */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  value={edit.email}
                  onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Birth date</Label>
                  <Input
                    type="date"
                    value={new Date(edit.birthDate).toISOString().slice(0, 10)}
                    onChange={(e) => setEdit({ ...edit, birthDate: new Date(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={edit.phone}
                    onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                  />
                </div>
              </div>
              {/* <div>
                <Label>Address</Label>
                <Input value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} />
              </div> */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!edit) return;
                toast.success("Patient updated");
                setEdit(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete patient?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDel(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!del) return;
                toast.success("Patient deleted");
                setDel(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreatePatientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={() => {
          toast.success("Patient created");
        }}
      />
    </div>
  );
}

function CreatePatientDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Patient) => void;
}) {
  // const [form, setForm] = useState({ name: "", birthDate: "", phone: "", email: "", address: "" });
  const [form, setForm] = useState({ name: "", birthDate: "", phone: "", email: ""});

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const id = Math.floor(Math.random() * 90000) + 10000;
    onCreate({
      id,
      name: form.name.trim(),
      birthDate: new Date(form.birthDate),
      phone: form.phone.trim(),
      email: form.email.trim(),
      appointments: [],
    });
    setForm({ name: "", birthDate: "", phone: "", email: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Birth date</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 000-0000"
              />
            </div>
          </div>

          {/* <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
            />
          </div> */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
