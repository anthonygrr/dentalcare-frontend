import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MedicalRecordResponseItem } from "@/types/medical-records-response";
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
import { Eye, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { toast } from "sonner";
import { getMedicalRecordsByPage } from "@/actions/medical-records/get-medical-records-by-page";
import usePaginatedMedicalRecord from "@/hooks/usePaginatedMedicalRecord";
import { useUpdateMedicalRecord } from "@/hooks/useUpdateMedicalRecord";
import { useDeleteMedicalRecord } from "@/hooks/useDeleteMedicalRecord";

export const Route = createFileRoute("/medical-records")({
  head: () => ({ meta: [{ title: "Medical Records — DentalCare" }] }),
  component: RecordsPage,
});

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function RecordsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [q, setQ] = useState("");

  const { data: recordsResponse, isLoading } = usePaginatedMedicalRecord(page, size);

  const records = recordsResponse?.records ?? [];
  const totalPages = recordsResponse?.pages ?? 1;

  const { data: allRecordsData } = useQuery({
    queryKey: ["medical-records", "all"],
    queryFn: () => getMedicalRecordsByPage(0, 10_000),
    staleTime: 1000 * 60 * 5,
  });

  const allRecords = allRecordsData?.records ?? [];

  const isSearching = q.trim().length > 0;
  const displayRecords = isSearching
    ? allRecords.filter((r) =>
        r.patientName.toLowerCase().includes(q.toLowerCase()) ||
        r.diagnosis.toLowerCase().includes(q.toLowerCase()),
      )
    : records;

  const updateMutation = useUpdateMedicalRecord();
  const deleteMutation = useDeleteMedicalRecord();

  const [view, setView] = useState<MedicalRecordResponseItem | null>(null);
  const [edit, setEdit] = useState<MedicalRecordResponseItem | null>(null);
  const [del, setDel] = useState<MedicalRecordResponseItem | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Medical Records</h1>
        <p className="text-sm text-muted-foreground">View and manage patient medical history.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All Records</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patient or diagnosis..."
              className="pl-9"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : displayRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayRecords.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.patientName}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.diagnosis}</TableCell>
                      <TableCell>{r.treatment}</TableCell>
                      <TableCell>{r.doctorName}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => setView(r)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDel(r)}>
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

      {/* View Dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medical Record</DialogTitle>
            <DialogDescription>
              {view?.patientName} &middot; {view?.date}
            </DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Patient: </span>{view.patientName}</p>
              <p><span className="text-muted-foreground">Doctor: </span>{view.doctorName}</p>
              <p><span className="text-muted-foreground">Date: </span>{view.date}</p>
              <p><span className="text-muted-foreground">Appointment: </span>{view.appointmentDate} at {formatTime(view.appointmentTime)}</p>
              <p><span className="text-muted-foreground">Procedure: </span>{view.procedure}</p>
              <p><span className="text-muted-foreground">Diagnosis: </span>{view.diagnosis}</p>
              <p><span className="text-muted-foreground">Treatment: </span>{view.treatment}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditRecordDialog
        record={edit}
        onClose={() => setEdit(null)}
        updateMutation={updateMutation}
      />

      {/* Delete Dialog */}
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete record?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDel(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!del) return;
                deleteMutation.mutate(del.id, {
                  onSuccess: () => { toast.success("Record deleted"); setDel(null); },
                  onError: () => { toast.error("Failed to delete record"); },
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
    </div>
  );
}

// ─── Edit Dialog ────────────────────────────────────────────────

function EditRecordDialog({
  record,
  onClose,
  updateMutation,
}: {
  record: MedicalRecordResponseItem | null;
  onClose: () => void;
  updateMutation: ReturnType<typeof useUpdateMedicalRecord>;
}) {
  const [form, setForm] = useState({ diagnosis: "", treatment: "" });
  const [errors, setErrors] = useState<{ diagnosis?: string; treatment?: string }>({});

  useEffect(() => {
    if (record) {
      setForm({ diagnosis: record.diagnosis, treatment: record.treatment });
      setErrors({});
    }
  }, [record]);

  const save = () => {
    if (!record) return;
    const next: typeof errors = {};
    if (!form.diagnosis.trim()) next.diagnosis = "Diagnosis is required";
    if (!form.treatment.trim()) next.treatment = "Treatment is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    updateMutation.mutate(
      { id: record.id, payload: { diagnosis: form.diagnosis.trim(), treatment: form.treatment.trim() } },
      {
        onSuccess: () => { toast.success("Record updated"); onClose(); },
        onError: () => { toast.error("Failed to update record"); },
      },
    );
  };

  if (!record) return null;

  return (
    <Dialog open={!!record} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>{record.patientName} &middot; {record.date}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Diagnosis</Label>
            <Input
              value={form.diagnosis}
              onChange={(e) => { setForm({ ...form, diagnosis: e.target.value }); setErrors({ ...errors, diagnosis: undefined }); }}
            />
            {errors.diagnosis && <p className="text-sm text-destructive mt-1">{errors.diagnosis}</p>}
          </div>
          <div>
            <Label>Treatment</Label>
            <Input
              value={form.treatment}
              onChange={(e) => { setForm({ ...form, treatment: e.target.value }); setErrors({ ...errors, treatment: undefined }); }}
            />
            {errors.treatment && <p className="text-sm text-destructive mt-1">{errors.treatment}</p>}
          </div>
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
