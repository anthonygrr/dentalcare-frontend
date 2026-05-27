import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  medicalRecords as initial,
  type MedicalRecord,
} from "@/lib/mockData";
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
import { Textarea } from "@/components/ui/textarea";
import { Eye, Pencil, Trash2, Search } from "lucide-react";
import { DataPagination, paginate } from "@/components/DataPagination";
import { toast } from "sonner";

export const Route = createFileRoute("/medical-records")({
  head: () => ({ meta: [{ title: "Medical Records — BrightSmile" }] }),
  component: RecordsPage,
});

function RecordsPage() {
  const [data, setData] = useState<MedicalRecord[]>(initial);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<MedicalRecord | null>(null);
  const [edit, setEdit] = useState<MedicalRecord | null>(null);
  const [del, setDel] = useState<MedicalRecord | null>(null);

  const filtered = useMemo(
    () =>
      data.filter(
        (r) =>
          r.patient.toLowerCase().includes(q.toLowerCase()) ||
          r.diagnosis.toLowerCase().includes(q.toLowerCase()),
      ),
    [data, q],
  );
  const { pageItems, totalPages, page: safePage } = paginate(filtered, page, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Medical Records</h1>
        <p className="text-sm text-muted-foreground">
          View and manage patient medical history.
        </p>
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
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.patient}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.diagnosis}</TableCell>
                    <TableCell>{r.treatment}</TableCell>
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
                ))}
                {pageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No records found.
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
            <DialogTitle>Record · {view?.patient}</DialogTitle>
            <DialogDescription>{view?.id} · {view?.date}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Diagnosis: </span>{view.diagnosis}</p>
              <p><span className="text-muted-foreground">Treatment: </span>{view.treatment}</p>
              <p><span className="text-muted-foreground">Notes: </span>{view.notes}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div>
                <Label>Diagnosis</Label>
                <Input value={edit.diagnosis} onChange={(e) => setEdit({ ...edit, diagnosis: e.target.value })} />
              </div>
              <div>
                <Label>Treatment</Label>
                <Input value={edit.treatment} onChange={(e) => setEdit({ ...edit, treatment: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!edit) return;
                setData((d) => d.map((x) => (x.id === edit.id ? edit : x)));
                toast.success("Record updated");
                setEdit(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                setData((d) => d.filter((x) => x.id !== del.id));
                toast.success("Record deleted");
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
