import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getPatientsByPage } from "@/actions/patients/get-patients-by-page";
import usePaginatedPatient from "@/hooks/usePaginatedPatient";
import { useCreatePatient } from "@/hooks/useCreatePatient";
import { useUpdatePatient } from "@/hooks/useUpdatePatient";
import { useDeletePatient } from "@/hooks/useDeletePatient";

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

  const createMutation = useCreatePatient(page, size);
  const updateMutation = useUpdatePatient(page, size);
  const deleteMutation = useDeletePatient(page, size);

  const [q, setQ] = useState("");
  const [view, setView] = useState<Patient | null>(null);
  const [edit, setEdit] = useState<Patient | null>(null);
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [del, setDel] = useState<Patient | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const isSearching = q.trim().length > 0;

  const { data: allPatientsData } = useQuery({
    queryKey: ["patients", "all"],
    queryFn: () => getPatientsByPage(0, 10_000),
    staleTime: 1000 * 60 * 5,
  });

  const allPatients = allPatientsData?.patients ?? [];

  const displayPatients = isSearching
    ? allPatients.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      )
    : patients;

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
              onChange={(e) => setQ(e.target.value)}
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
                  <TableHead>Age</TableHead>
                  <TableHead>Phone</TableHead>

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
                ) : displayPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayPatients.map((p) => (
                    <TableRow key={String(p.id)}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-medium">{p.email}</TableCell>

                      <TableCell className="text-muted-foreground">
                        {p.birthDate.toString()}
                      </TableCell>
                      <TableCell>{getAge(p.birthDate)}</TableCell>
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
          {!isSearching && (
            <DataPagination
              page={page + 1}
              totalPages={totalPages}
              onChange={(p) => setPage(p - 1)}
            />
          )}
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

      <Dialog
        open={!!edit}
        onOpenChange={(o) => {
          if (!o) {
            setEdit(null);
            setEditErrors({});
          }
        }}
      >
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
                  onChange={(e) => {
                    setEdit({ ...edit, name: e.target.value });
                    setEditErrors({ ...editErrors, name: undefined });
                  }}
                />
                {editErrors.name && <p className="text-sm text-destructive mt-1">{editErrors.name}</p>}
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  value={edit.email}
                  onChange={(e) => {
                    setEdit({ ...edit, email: e.target.value });
                    setEditErrors({ ...editErrors, email: undefined });
                  }}
                />
                {editErrors.email && <p className="text-sm text-destructive mt-1">{editErrors.email}</p>}
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
                    onChange={(e) => {
                      setEdit({ ...edit, phone: e.target.value });
                      setEditErrors({ ...editErrors, phone: undefined });
                    }}
                  />
                  {editErrors.phone && <p className="text-sm text-destructive mt-1">{editErrors.phone}</p>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!edit) return;

                const errs: typeof editErrors = {};

                if (!edit.name.trim()) {
                  errs.name = "Name is required";
                }

                if (!edit.email.trim()) {
                  errs.email = "Email is required";
                } else if (
                  allPatients.some(
                    (p) => p.email.toLowerCase() === edit.email.trim().toLowerCase() && p.id !== edit.id,
                  )
                ) {
                  errs.email = "Email is already in use";
                }

                if (!edit.phone.trim()) {
                  errs.phone = "Phone is required";
                } else if (
                  allPatients.some((p) => p.phone === edit.phone.trim() && p.id !== edit.id)
                ) {
                  errs.phone = "Phone is already in use";
                }

                setEditErrors(errs);
                if (Object.keys(errs).length > 0) return;

                updateMutation.mutate(
                  {
                    id: edit.id,
                    payload: {
                      name: edit.name,
                      email: edit.email,
                      phone: edit.phone,
                      birthDate: new Date(edit.birthDate).toISOString().slice(0, 10),
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Patient updated");
                      setEdit(null);
                    },
                    onError: () => {
                      toast.error("Failed to update patient");
                    },
                  },
                );
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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
                deleteMutation.mutate(del.id, {
                  onSuccess: () => {
                    toast.success("Patient deleted");
                    setDel(null);
                  },
                  onError: () => {
                    toast.error("Failed to delete patient");
                  },
                });
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreatePatientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingPatients={allPatients}
        onCreate={(payload) => {
          createMutation.mutate(payload, {
            onSuccess: () => {
              toast.success("Patient created");
              setCreateOpen(false);
            },
            onError: () => {
              toast.error("Failed to create patient");
            },
          });
        }}
        isPending={createMutation.isPending}
      />
    </div>
  );
}

function CreatePatientDialog({
  open,
  onOpenChange,
  existingPatients,
  onCreate,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingPatients: Patient[];
  onCreate: (payload: { name: string; email: string; phone: string; birthDate: string }) => void;
  isPending?: boolean;
}) {
  const [form, setForm] = useState({ name: "", birthDate: "", phone: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};

    if (!form.name.trim()) {
      next.name = "Name is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (existingPatients.some((p) => p.email.toLowerCase() === form.email.trim().toLowerCase())) {
      next.email = "Email is already in use";
    }

    if (!form.phone.trim()) {
      next.phone = "Phone is required";
    } else if (existingPatients.some((p) => p.phone === form.phone.trim())) {
      next.phone = "Phone is already in use";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    onCreate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      birthDate: form.birthDate,
    });
    setForm({ name: "", birthDate: "", phone: "", email: "" });
    setErrors({});
  };

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setForm({ name: "", birthDate: "", phone: "", email: "" });
          setErrors({});
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Full name"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Birth date</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => update("birthDate", e.target.value)}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 000-0000"
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
