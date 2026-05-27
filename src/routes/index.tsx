import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  CalendarDays,
  CalendarCheck,
  Plus,
} from "lucide-react";
import { patients, statusColor } from "@/lib/mockData";
import { useAppointments } from "@/lib/appointmentsStore";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import usePaginatedPatient from "@/hooks/usePaginatedPatient";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — BrightSmile" },
      {
        name: "description",
        content: "Overview of patients, schedules and upcoming appointments.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
      const { data: patientResponse } = usePaginatedPatient(0, 6);
      console.log(patientResponse);
      
  const appointments = useAppointments();
  const [createOpen, setCreateOpen] = useState(false);

  const pending = appointments.filter(
    (a) => a.status === "Scheduled" || a.status === "Confirmed",
  ).length;
  const today = new Date().toISOString().slice(0, 10);
  const todaysAppts = appointments.filter((a) => a.date === today).length;
  const upcoming = appointments
    .filter((a) => a.date >= today && a.status !== "Cancelled")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const stats = [
    { label: "Patients", value: patients.length, icon: Users, tint: "bg-primary/10 text-primary" },
    { label: "Pending", value: pending, icon: Clock, tint: "bg-amber-500/10 text-amber-600" },
    { label: "Today's Schedule", value: todaysAppts, icon: CalendarDays, tint: "bg-cyan-500/10 text-cyan-600" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarCheck, tint: "bg-emerald-500/10 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Dr. Adams</h1>
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

      <AppointmentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
