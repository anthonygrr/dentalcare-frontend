import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  type Appointment,
  type AppointmentStatus,
  statusColor,
} from "@/lib/mockData";
import {
  ALL_STATUSES,
  appointmentsStore,
  useAppointments,
} from "@/lib/appointmentsStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { DataPagination, paginate } from "@/components/DataPagination";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/appointments")({
  head: () => ({ meta: [{ title: "Appointments — BrightSmile" }] }),
  component: AppointmentsPage,
});

const TABS: (AppointmentStatus | "All")[] = ["All", ...ALL_STATUSES];

function AppointmentsPage() {
  const data = useAppointments();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [procedureFilter, setProcedureFilter] = useState<string>("all");
  const [view, setView] = useState<Appointment | null>(null);
  const [edit, setEdit] = useState<Appointment | null>(null);
  const [del, setDel] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const procedures = useMemo(
    () => Array.from(new Set(data.map((a) => a.procedure))).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((a) => {
      if (tab !== "All" && a.status !== tab) return false;
      if (procedureFilter !== "all" && a.procedure !== procedureFilter)
        return false;
      if (
        q &&
        !a.patient.toLowerCase().includes(q) &&
        !a.procedure.toLowerCase().includes(q) &&
        !a.id.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [data, tab, search, procedureFilter]);

  const { pageItems, totalPages, page: safePage } = paginate(filtered, page, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Manage all clinic appointments by status.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Appointment
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>All Appointments</CardTitle>
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as AppointmentStatus | "All");
              setPage(1);
            }}
          >
            <TabsList className="flex-wrap h-auto">
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patient, procedure or ID…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={procedureFilter}
              onValueChange={(v) => {
                setProcedureFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Procedure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All procedures</SelectItem>
                {procedures.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.patient}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell>{a.procedure}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[a.status]}>{a.status}</Badge>
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
                ))}
                {pageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataPagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </CardContent>
      </Card>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>{view?.id}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Patient: </span>{view.patient}</p>
              <p><span className="text-muted-foreground">Date: </span>{view.date} at {view.time}</p>
              <p><span className="text-muted-foreground">Procedure: </span>{view.procedure}</p>
              <p><span className="text-muted-foreground">Status: </span>{view.status}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AppointmentDialog
        open={!!edit}
        onOpenChange={(o) => !o && setEdit(null)}
        appointment={edit}
      />

      <AppointmentDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete appointment?</DialogTitle>
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
                appointmentsStore.remove(del.id);
                toast.success("Appointment deleted");
                setDel(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
