import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { statusColor, type Appointment } from "@/lib/mockData";
import { useAppointments } from "@/lib/appointmentsStore";
import { AppointmentDialog } from "@/components/AppointmentDialog";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — BrightSmile" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const appointments = useAppointments();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [edit, setEdit] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const key = date?.toISOString().slice(0, 10);
  const dayAppts = appointments.filter((a) => a.date === key);

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

        <Card>
          <CardHeader>
            <CardTitle>Appointments on {date?.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            {dayAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No appointments on this date.
              </p>
            ) : (
              <div className="divide-y">
                {dayAppts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{a.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.procedure} · {a.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusColor[a.status]}>
                        {a.status}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => setEdit(a)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AppointmentDialog
        open={!!edit}
        onOpenChange={(o) => !o && setEdit(null)}
        appointment={edit}
      />
      <AppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultDate={key}
      />
    </div>
  );
}
