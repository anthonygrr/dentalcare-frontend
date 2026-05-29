import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AppointmentResponseItem } from "@/types/appointments-response";
import { AppointmentStatus } from "@/types/appointmentStatus.enum";
import type { Patient } from "@/types/patient.interface";
import type { Doctor } from "@/types/doctor.interface";
import { Procedures } from "@/types/procedures.enum";
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
import { Badge } from "@/components/ui/badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Eye, Pencil, Trash2, Search, Plus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { toast } from "sonner";
import { getAppointmentsByPage } from "@/actions/appointments/get-appointments-by-page";
import { getPatientsByPage } from "@/actions/patients/get-patients-by-page";
import { getDoctorsByPage } from "@/actions/doctors/get-doctors-by-page";
import usePaginatedAppointment from "@/hooks/usePaginatedAppointment";
import { useCreateAppointment } from "@/hooks/useCreateAppointment";
import { useUpdateAppointment } from "@/hooks/useUpdateAppointment";
import { useDeleteAppointment } from "@/hooks/useDeleteAppointment";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/appointments")({
  head: () => ({ meta: [{ title: "Appointments — BrightSmile" }] }),
  component: AppointmentsPage,
});

const statusLabel: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: "Scheduled",
  [AppointmentStatus.CONFIRMED]: "Confirmed",
  [AppointmentStatus.IN_PROGRESS]: "In Progress",
  [AppointmentStatus.STARTED]: "Started",
  [AppointmentStatus.COMPLETED]: "Completed",
  [AppointmentStatus.CANCELLED]: "Cancelled",
};

const statusColor: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  [AppointmentStatus.CONFIRMED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  [AppointmentStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  [AppointmentStatus.STARTED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  [AppointmentStatus.COMPLETED]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  [AppointmentStatus.CANCELLED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

const STATUS_TABS = ["All", ...Object.values(AppointmentStatus)] as const;
const PROCEDURE_LIST = Object.values(Procedures);

function AppointmentsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [statusTab, setStatusTab] = useState<string>("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterProcedure, setFilterProcedure] = useState<string>("all");
  const [q, setQ] = useState("");

  const statusParam = statusTab === "All" ? undefined : (statusTab as AppointmentStatus);
  const procedureParam = filterProcedure === "all" ? undefined : filterProcedure;

  const { data: appointmentsResponse, isLoading } = usePaginatedAppointment(
    page, size, statusParam, filterDate || undefined, procedureParam, q.trim() || undefined,
  );

  const appointments = appointmentsResponse?.appointments ?? [];
  const totalPages = appointmentsResponse?.pages ?? 1;

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const [view, setView] = useState<AppointmentResponseItem | null>(null);
  const [edit, setEdit] = useState<AppointmentResponseItem | null>(null);
  const [del, setDel] = useState<AppointmentResponseItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const needsExtraData = createOpen || edit !== null;

  const { data: allPatientsData } = useQuery({
    queryKey: ["patients", "all"],
    queryFn: () => getPatientsByPage(0, 10_000),
    enabled: needsExtraData,
    staleTime: 1000 * 60 * 5,
  });

  const { data: allDoctorsData } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => getDoctorsByPage(0, 10_000),
    enabled: needsExtraData,
    staleTime: 1000 * 60 * 5,
  });

  const { data: allAppointmentsData } = useQuery({
    queryKey: ["appointments", "all"],
    queryFn: () => getAppointmentsByPage(0, 10_000),
    enabled: needsExtraData,
    staleTime: 1000 * 60 * 5,
  });

  const allPatients = allPatientsData?.patients ?? [];
  const allDoctors = allDoctorsData?.doctors ?? [];
  const allAppointments = allAppointmentsData?.appointments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage all clinic appointments.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Appointment
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>All Appointments</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1">
              {STATUS_TABS.map((t) => (
                <Button
                  key={t}
                  variant={statusTab === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setStatusTab(t); setPage(0); }}
                >
                  {t === "All" ? "All" : statusLabel[t as AppointmentStatus]}
                </Button>
              ))}
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient name…"
                className="pl-9"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(0); }}
              />
            </div>
            <Input
              type="date"
              className="w-fit"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(0); }}
            />
            <Select value={filterProcedure} onValueChange={(v) => { setFilterProcedure(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Procedure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All procedures</SelectItem>
                {PROCEDURE_LIST.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.patientName}</TableCell>
                      <TableCell>{a.doctorName}</TableCell>
                      <TableCell>{a.date}</TableCell>
                      <TableCell>{formatTime(a.time)}</TableCell>
                      <TableCell>{a.procedure}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[a.status]}>{statusLabel[a.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => setView(a)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEdit(a)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDel(a)}>
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

      {/* View Dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment #{view?.id}</DialogTitle>
            <DialogDescription>{view?.procedure}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Patient: </span>{view.patientName}</p>
              <p><span className="text-muted-foreground">Doctor: </span>{view.doctorName}</p>
              <p><span className="text-muted-foreground">Date: </span>{view.date} at {formatTime(view.time)}</p>
              <p><span className="text-muted-foreground">Procedure: </span>{view.procedure}</p>
              <p>
                <span className="text-muted-foreground">Status: </span>
                <Badge className={statusColor[view.status]}>{statusLabel[view.status]}</Badge>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditAppointmentDialog
        appointment={edit}
        onClose={() => { setEdit(null); }}
        updateMutation={updateMutation}
        allAppointments={allAppointments}
      />

      {/* Delete Dialog */}
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete appointment?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDel(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!del) return;
                deleteMutation.mutate(del.id, {
                  onSuccess: () => { toast.success("Appointment deleted"); setDel(null); },
                  onError: () => { toast.error("Failed to delete appointment"); },
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

      {/* Create Dialog */}
      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        createMutation={createMutation}
        allPatients={allPatients}
        allDoctors={allDoctors}
        allAppointments={allAppointments}
      />
    </div>
  );
}

// ─── Searchable Select ────────────────────────────────────────────

function SearchableSelect<T extends { id: Number; name: String }>({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
}: {
  items: T[];
  value: number | null;
  onChange: (id: number) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = items.find((i) => Number(i.id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? String(selected.name) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={String(item.id)}
                  value={String(item.name)}
                  onSelect={() => {
                    onChange(Number(item.id));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      Number(item.id) === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {String(item.name)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Create Dialog ────────────────────────────────────────────────

function CreateAppointmentDialog({
  open,
  onOpenChange,
  createMutation,
  allPatients,
  allDoctors,
  allAppointments,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  createMutation: ReturnType<typeof useCreateAppointment>;
  allPatients: Patient[];
  allDoctors: Doctor[];
  allAppointments: AppointmentResponseItem[];
}) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    procedure: "",
    patientId: null as number | null,
    doctorId: null as number | null,
  });
  const [errors, setErrors] = useState<{ date?: string; time?: string; procedure?: string; patientId?: string; doctorId?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.date) next.date = "Date is required";
    if (!form.time) next.time = "Time is required";
    if (!form.procedure.trim()) next.procedure = "Procedure is required";
    if (form.patientId === null) next.patientId = "Patient is required";
    if (form.doctorId === null) next.doctorId = "Doctor is required";

    if (form.date && form.time && form.doctorId !== null) {
      const conflict = allAppointments.some(
        (a) => a.date === form.date && a.time === form.time && a.doctorId === form.doctorId,
      );
      if (conflict) {
        next.doctorId = "Doctor already has an appointment at this date and time";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    createMutation.mutate(
      {
        date: form.date,
        time: form.time,
        procedure: form.procedure.trim(),
        patientId: form.patientId!,
        doctorId: form.doctorId!,
      },
      {
        onSuccess: () => {
          toast.success("Appointment created");
          setForm({ date: "", time: "", procedure: "", patientId: null, doctorId: null });
          setErrors({});
          onOpenChange(false);
        },
        onError: () => { toast.error("Failed to create appointment"); },
      },
    );
  };

  const update = (field: string, value: unknown) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setForm({ date: "", time: "", procedure: "", patientId: null, doctorId: null });
          setErrors({});
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Patient</Label>
            <SearchableSelect
              items={allPatients}
              value={form.patientId}
              onChange={(id) => update("patientId", id)}
              placeholder="Select a patient…"
              searchPlaceholder="Search patients…"
              emptyMessage="No patients found."
            />
            {errors.patientId && <p className="text-sm text-destructive mt-1">{errors.patientId}</p>}
          </div>
          <div>
            <Label>Doctor</Label>
            <SearchableSelect
              items={allDoctors}
              value={form.doctorId}
              onChange={(id) => update("doctorId", id)}
              placeholder="Select a doctor…"
              searchPlaceholder="Search doctors…"
              emptyMessage="No doctors found."
            />
            {errors.doctorId && <p className="text-sm text-destructive mt-1">{errors.doctorId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
              {errors.date && <p className="text-sm text-destructive mt-1">{errors.date}</p>}
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} />
              {errors.time && <p className="text-sm text-destructive mt-1">{errors.time}</p>}
            </div>
          </div>
          <div>
            <Label>Procedure</Label>
            <Select value={form.procedure} onValueChange={(v) => update("procedure", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a procedure" />
              </SelectTrigger>
              <SelectContent>
                {PROCEDURE_LIST.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.procedure && <p className="text-sm text-destructive mt-1">{errors.procedure}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────

function EditAppointmentDialog({
  appointment,
  onClose,
  updateMutation,
  allAppointments,
}: {
  appointment: AppointmentResponseItem | null;
  onClose: () => void;
  updateMutation: ReturnType<typeof useUpdateAppointment>;
  allAppointments: AppointmentResponseItem[];
}) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    procedure: "",
    status: AppointmentStatus.SCHEDULED,
    diagnosis: "",
    treatment: "",
  });
  const [errors, setErrors] = useState<{ date?: string; time?: string; procedure?: string }>({});

  const isCompleted = form.status === AppointmentStatus.COMPLETED;

  useEffect(() => {
    if (appointment) {
      setForm({
        date: appointment.date,
        time: appointment.time,
        procedure: appointment.procedure,
        status: appointment.status,
        diagnosis: "",
        treatment: "",
      });
      setErrors({});
    }
  }, [appointment]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.date) next.date = "Date is required";
    if (!form.time) next.time = "Time is required";
    if (!form.procedure.trim()) next.procedure = "Procedure is required";

    if (form.date && form.time && appointment) {
      const conflict = allAppointments.some(
        (a) => a.id !== appointment.id && a.date === form.date && a.time === form.time && a.doctorId === appointment.doctorId,
      );
      if (conflict) {
        next.time = "Doctor already has an appointment at this date and time";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!appointment || !validate()) return;
    updateMutation.mutate(
      {
        id: appointment.id,
        payload: {
          date: form.date,
          time: form.time,
          procedure: form.procedure.trim(),
          status: form.status,
          ...(isCompleted ? { diagnosis: form.diagnosis.trim(), treatment: form.treatment.trim() } : {}),
        },
      },
      {
        onSuccess: () => { toast.success("Appointment updated"); onClose(); },
        onError: () => { toast.error("Failed to update appointment"); },
      },
    );
  };

  if (!appointment) return null;

  return (
    <Dialog open={!!appointment} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>#{String(appointment.id)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Patient</Label>
            <p className="text-sm font-medium">{appointment.patientName}</p>
          </div>
          <div>
            <Label>Doctor</Label>
            <p className="text-sm font-medium">{appointment.doctorName}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: undefined }); }} />
              {errors.date && <p className="text-sm text-destructive mt-1">{errors.date}</p>}
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={(e) => { setForm({ ...form, time: e.target.value }); setErrors({ ...errors, time: undefined }); }} />
              {errors.time && <p className="text-sm text-destructive mt-1">{errors.time}</p>}
            </div>
          </div>
          <div>
            <Label>Procedure</Label>
            <Select value={form.procedure} onValueChange={(v) => { setForm({ ...form, procedure: v }); setErrors({ ...errors, procedure: undefined }); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROCEDURE_LIST.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.procedure && <p className="text-sm text-destructive mt-1">{errors.procedure}</p>}
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as AppointmentStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AppointmentStatus).map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isCompleted && (
            <>
              <div>
                <Label>Diagnosis</Label>
                <Input
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="Diagnosis notes"
                />
              </div>
              <div>
                <Label>Treatment</Label>
                <Input
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  placeholder="Treatment plan"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
