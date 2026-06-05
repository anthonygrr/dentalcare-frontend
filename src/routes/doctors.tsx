import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Doctor } from "@/types/doctor.interface";
import { Specialty } from "@/types/specialty.enum";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Pencil, Trash2, Search, Plus, Loader2 } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { toast } from "sonner";
import { getDoctorsByPage } from "@/actions/get-doctors-by-page";
import usePaginatedDoctor from "@/hooks/usePaginatedDoctor";
import { useCreateDoctor } from "@/hooks/useCreateDoctor";
import { useUpdateDoctor } from "@/hooks/useUpdateDoctor";
import { useDeleteDoctor } from "@/hooks/useDeleteDoctor";

export const Route = createFileRoute("/doctors")({
  head: () => ({ meta: [{ title: "Doctors — DentalCare" }] }),
  component: DoctorsPage,
});

const specialtyLabels: Record<Specialty, string> = {
  [Specialty.DENTIST]: "Dentist",
  [Specialty.GENERAL]: "General",
  [Specialty.TAUTOLOGOUS]: "Tautologous",
  [Specialty.FAMILY_MEDICINE]: "Family Medicine",
  [Specialty.INTERNAL_MEDICINE]: "Internal Medicine",
  [Specialty.PEDIATRIC]: "Pediatric",
  [Specialty.OBSTETRICS_GYNECOLOGY]: "Obstetrics & Gynecology",
  [Specialty.DIAGNOSIS]: "Diagnosis",
};

function DoctorsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const { data: doctorsResponse, isLoading } = usePaginatedDoctor(page, size);

  const doctors = doctorsResponse?.doctors ?? [];
  const totalPages = doctorsResponse?.pages ?? 1;

  const createMutation = useCreateDoctor(page, size);
  const updateMutation = useUpdateDoctor(page, size);
  const deleteMutation = useDeleteDoctor(page, size);

  const [q, setQ] = useState("");
  const [view, setView] = useState<Doctor | null>(null);
  const [edit, setEdit] = useState<Doctor | null>(null);
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [del, setDel] = useState<Doctor | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const isSearching = q.trim().length > 0;
  const needsAllDoctors = isSearching || createOpen || edit !== null;

  const { data: allDoctorsData, isLoading: isSearchLoading } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => getDoctorsByPage(0, 10_000),
    enabled: needsAllDoctors,
    staleTime: 1000 * 60 * 5,
  });

  const allDoctors = allDoctorsData?.doctors ?? [];

  const displayDoctors = isSearching
    ? allDoctors.filter((p) =>
        String(p.name).toLowerCase().includes(q.toLowerCase()),
      )
    : doctors;

  const isLoadingAll = isSearching && isSearchLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>
          <p className="text-sm text-muted-foreground">Browse and manage doctor records.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Doctor
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All Doctors</CardTitle>
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoading || isLoadingAll) ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : displayDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No doctors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayDoctors.map((p) => (
                    <TableRow key={String(p.id)}>
                      <TableCell className="font-medium">{String(p.name)}</TableCell>
                      <TableCell>{String(p.email)}</TableCell>
                      <TableCell className="text-muted-foreground">{String(p.phone)}</TableCell>
                      <TableCell>{specialtyLabels[p.specialty as Specialty] ?? String(p.specialty)}</TableCell>
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
            <DialogTitle>{String(view?.name)}</DialogTitle>
            <DialogDescription>{String(view?.id)}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Email: </span>
                {String(view.email)}
              </p>
              <p>
                <span className="text-muted-foreground">Phone: </span>
                {String(view.phone)}
              </p>
              <p>
                <span className="text-muted-foreground">Address: </span>
                {String(view.address)}
              </p>
              <p>
                <span className="text-muted-foreground">Specialty: </span>
                {specialtyLabels[view.specialty as Specialty] ?? String(view.specialty)}
              </p>
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
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={String(edit.name)}
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
                  value={String(edit.email)}
                  onChange={(e) => {
                    setEdit({ ...edit, email: e.target.value });
                    setEditErrors({ ...editErrors, email: undefined });
                  }}
                />
                {editErrors.email && <p className="text-sm text-destructive mt-1">{editErrors.email}</p>}
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={String(edit.phone)}
                  onChange={(e) => {
                    setEdit({ ...edit, phone: e.target.value });
                    setEditErrors({ ...editErrors, phone: undefined });
                  }}
                />
                {editErrors.phone && <p className="text-sm text-destructive mt-1">{editErrors.phone}</p>}
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={String(edit.address)}
                  onChange={(e) => setEdit({ ...edit, address: e.target.value })}
                />
              </div>
              <div>
                <Label>Specialty</Label>
                <Select
                  value={String(edit.specialty)}
                  onValueChange={(v) => setEdit({ ...edit, specialty: v as Specialty })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(specialtyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

                if (!String(edit.name).trim()) {
                  errs.name = "Name is required";
                }

                if (!String(edit.email).trim()) {
                  errs.email = "Email is required";
                } else if (
                  allDoctors.some(
                    (p) => String(p.email).toLowerCase() === String(edit.email).trim().toLowerCase() && p.id !== edit.id,
                  )
                ) {
                  errs.email = "Email is already in use";
                }

                if (!String(edit.phone).trim()) {
                  errs.phone = "Phone is required";
                } else if (
                  allDoctors.some((p) => String(p.phone) === String(edit.phone).trim() && p.id !== edit.id)
                ) {
                  errs.phone = "Phone is already in use";
                }

                setEditErrors(errs);
                if (Object.keys(errs).length > 0) return;

                updateMutation.mutate(
                  {
                    id: edit.id,
                    payload: {
                      name: String(edit.name).trim(),
                      email: String(edit.email).trim(),
                      phone: String(edit.phone).trim(),
                      address: String(edit.address),
                      specialty: String(edit.specialty),
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Doctor updated");
                      setEdit(null);
                    },
                    onError: () => {
                      toast.error("Failed to update doctor");
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
            <DialogTitle>Delete doctor?</DialogTitle>
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
                    toast.success("Doctor deleted");
                    setDel(null);
                  },
                  onError: () => {
                    toast.error("Failed to delete doctor");
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

      <CreateDoctorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingDoctors={allDoctors}
        onCreate={(payload) => {
          createMutation.mutate(payload, {
            onSuccess: () => {
              toast.success("Doctor created");
              setCreateOpen(false);
            },
            onError: () => {
              toast.error("Failed to create doctor");
            },
          });
        }}
        isPending={createMutation.isPending}
      />
    </div>
  );
}

function CreateDoctorDialog({
  open,
  onOpenChange,
  existingDoctors,
  onCreate,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingDoctors: Doctor[];
  onCreate: (payload: { name: string; email: string; phone: string; address: string; specialty: string }) => void;
  isPending?: boolean;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", specialty: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};

    if (!form.name.trim()) {
      next.name = "Name is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (existingDoctors.some((p) => String(p.email).toLowerCase() === form.email.trim().toLowerCase())) {
      next.email = "Email is already in use";
    }

    if (!form.phone.trim()) {
      next.phone = "Phone is required";
    } else if (existingDoctors.some((p) => String(p.phone) === form.phone.trim())) {
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
      address: form.address.trim(),
      specialty: form.specialty,
    });
    setForm({ name: "", email: "", phone: "", address: "", specialty: "" });
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
          setForm({ name: "", email: "", phone: "", address: "", specialty: "" });
          setErrors({});
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Doctor</DialogTitle>
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
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(555) 000-0000"
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div>
            <Label>Specialty</Label>
            <Select
              value={form.specialty}
              onValueChange={(v) => update("specialty", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a specialty" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(specialtyLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
