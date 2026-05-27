import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_STATUSES, appointmentsStore } from "@/lib/appointmentsStore";
import type { Appointment, AppointmentStatus } from "@/lib/mockData";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment?: Appointment | null;
  defaultDate?: string;
};

const empty = (date?: string): Omit<Appointment, "id"> => ({
  patient: "",
  date: date ?? new Date().toISOString().slice(0, 10),
  time: "09:00",
  procedure: "Checkup",
  status: "Scheduled",
});

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  defaultDate,
}: Props) {
  const isEdit = !!appointment;
  const [form, setForm] = useState<Omit<Appointment, "id"> & { id?: string }>(
    appointment ?? empty(defaultDate),
  );

  useEffect(() => {
    if (open) setForm(appointment ?? empty(defaultDate));
  }, [open, appointment, defaultDate]);

  const save = () => {
    if (!form.patient.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (isEdit && form.id) {
      appointmentsStore.update(form as Appointment);
      toast.success("Appointment updated");
    } else {
      appointmentsStore.add(form);
      toast.success("Appointment created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Patient</Label>
            <Input
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
              placeholder="Patient full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Procedure</Label>
            <Input
              value={form.procedure}
              onChange={(e) => setForm({ ...form, procedure: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as AppointmentStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{isEdit ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
