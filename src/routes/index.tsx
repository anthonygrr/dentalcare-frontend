import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Clock,
  CalendarDays,
  CalendarCheck,
  Plus,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { AppointmentStatus } from "@/types/appointmentStatus.enum";
import type { Patient } from "@/types/patient.interface";
import type { Doctor } from "@/types/doctor.interface";
import { Procedures } from "@/types/procedures.enum";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { getPatientsByPage } from "@/actions/patients/get-patients-by-page";
import { getDoctorsByPage } from "@/actions/doctors/get-doctors-by-page";
import { getAppointmentsByPage } from "@/actions/appointments/get-appointments-by-page";
import { useCreateAppointment } from "@/hooks/useCreateAppointment";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — DentalCare" },
      {
        name: "description",
        content: "Overview of patients, schedules and upcoming appointments.",
      },
    ],
  }),
  component: Dashboard,
});

const statusColor: Record<string, string> = {
  SCHEDULED: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  CONFIRMED: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
  STARTED: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  IN_PROGRESS: "bg-violet-500/15 text-violet-700 border-violet-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  CANCELLED: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};

const PROCEDURE_LIST = Object.values(Procedures);

function Dashboard() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: patientResponse } = useQuery({
    queryKey: ["patients", "count"],
    queryFn: () => getPatientsByPage(0, 1),
    staleTime: 1000 * 60 * 5,
  });

  const today = new Date().toISOString().slice(0, 10);

  const { data: appointmentsData } = useQuery({
    queryKey: ["appointments", "all"],
    queryFn: () => getAppointmentsByPage(0, 100),
    staleTime: 1000 * 60 * 5,
  });

  const { data: allPatientsData } = useQuery({
    queryKey: ["patients", "all", "for-create"],
    queryFn: () => getPatientsByPage(0, 10_000),
    enabled: createOpen,
    staleTime: 1000 * 60 * 5,
  });

  const { data: allDoctorsData } = useQuery({
    queryKey: ["doctors", "all", "for-create"],
    queryFn: () => getDoctorsByPage(0, 10_000),
    enabled: createOpen,
    staleTime: 1000 * 60 * 5,
  });

  const allPatients = allPatientsData?.patients ?? [];
  const allDoctors = allDoctorsData?.doctors ?? [];

  const createMutation = useCreateAppointment();

  const allAppts = useMemo(() => {
    const raw = appointmentsData?.appointments ?? [];
    return raw.map((a) => ({
      ...a,
      patient: a.patientName,
    }));
  }, [appointmentsData]);

  const totalPatients = patientResponse?.total ?? 0;

  const pending = allAppts.filter(
    (a) => a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED,
  ).length;

  const todaysAppts = allAppts.filter((a) => a.date === today).length;

  const upcoming = allAppts
    .filter((a) => a.date >= today && a.status !== AppointmentStatus.CANCELLED)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const stats = [
    { label: "Patients", value: totalPatients, icon: Users, tint: "bg-primary/10 text-primary" },
    { label: "Pending", value: pending, icon: Clock, tint: "bg-amber-500/10 text-amber-600" },
    { label: "Today's Schedule", value: todaysAppts, icon: CalendarDays, tint: "bg-cyan-500/10 text-cyan-600" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarCheck, tint: "bg-emerald-500/10 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.fullName ?? "Dr. Adams"}</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening today.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-semibold">{s.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.tint}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{a.patient}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.procedure} · {a.date} at {a.time}
                  </p>
                </div>
                <Badge variant="outline" className={statusColor[a.status]}>
                  {a.status}
                </Badge>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        createMutation={createMutation}
        allPatients={allPatients}
        allDoctors={allDoctors}
        defaultDate={today}
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
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  createMutation: ReturnType<typeof useCreateAppointment>;
  allPatients: Patient[];
  allDoctors: Doctor[];
  defaultDate: string;
}) {
  const [form, setForm] = useState({
    date: defaultDate,
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
          setForm({ date: defaultDate, time: "", procedure: "", patientId: null, doctorId: null });
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
          setForm({ date: defaultDate, time: "", procedure: "", patientId: null, doctorId: null });
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
