import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { AppointmentStatus } from "@/types/appointmentStatus.enum";
import { Procedures } from "@/types/procedures.enum";
import type { Patient } from "@/types/patient.interface";
import type { Doctor } from "@/types/doctor.interface";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAppointmentsByPage } from "@/actions/appointments/get-appointments-by-page";
import { getPatientsByPage } from "@/actions/patients/get-patients-by-page";
import { getDoctorsByPage } from "@/actions/doctors/get-doctors-by-page";
import { useCreateAppointment } from "@/hooks/useCreateAppointment";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — DentalCare" }] }),
  component: CalendarPage,
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
  [AppointmentStatus.SCHEDULED]: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  [AppointmentStatus.CONFIRMED]: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
  [AppointmentStatus.IN_PROGRESS]: "bg-violet-500/15 text-violet-700 border-violet-500/30",
  [AppointmentStatus.STARTED]: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  [AppointmentStatus.COMPLETED]: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  [AppointmentStatus.CANCELLED]: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};

const PROCEDURE_LIST = Object.values(Procedures);

function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>();
  const key = date?.toISOString().slice(0, 10);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", "calendar", "all"],
    queryFn: () => getAppointmentsByPage(0, 10_000),
    staleTime: 1000 * 60 * 5,
  });

  const { data: allPatientsData } = useQuery({
    queryKey: ["patients", "all"],
    queryFn: () => getPatientsByPage(0, 10_000),
    enabled: createOpen,
    staleTime: 1000 * 60 * 5,
  });

  const { data: allDoctorsData } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => getDoctorsByPage(0, 10_000),
    enabled: createOpen,
    staleTime: 1000 * 60 * 5,
  });

  const allAppointments = data?.appointments ?? [];
  const allPatients = allPatientsData?.patients ?? [];
  const allDoctors = allDoctorsData?.doctors ?? [];
  const createMutation = useCreateAppointment();

  const dayAppts = key
    ? allAppointments.filter((a) => a.date === key)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Pick a date to view scheduled appointments.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card>
          <CardContent className="p-3">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
          </CardContent>
        </Card>

        {date && (
          <Card>
            <CardHeader>
              <CardTitle>Appointments on {date.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : dayAppts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No appointments on this date.
                </p>
              ) : (
                <div className="divide-y">
                  {dayAppts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{a.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.procedure} &middot; {a.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusColor[a.status]}>
                          {statusLabel[a.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        createMutation={createMutation}
        allPatients={allPatients}
        allDoctors={allDoctors}
        defaultDate={key ?? new Date().toISOString().slice(0, 10)}
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
