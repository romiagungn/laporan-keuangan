"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveReport, deleteSavedReport, getSavedReports } from "@/lib/actions/report.actions.ts";
import { toast } from "sonner";
import { Bookmark, Trash2, X } from "lucide-react";

type SavedReport = {
  id: number;
  name: string;
  filters: any;
};

export function CustomReportsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedReports, setSavedReports] = React.useState<SavedReport[]>([]);
  const [reportName, setReportName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    getSavedReports().then(setSavedReports);
  }, []);

  const handleSaveReport = async () => {
    if (!reportName) {
      toast.error("Nama laporan tidak boleh kosong.");
      return;
    }

    const filters = {
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      categoryIds: searchParams.getAll("categoryId").map(Number) || undefined,
    };

    try {
      await saveReport({ name: reportName, filters });
      toast.success(`Laporan "${reportName}" berhasil disimpan.`);
      setReportName("");
      setIsDialogOpen(false);
      // Refresh the list
      getSavedReports().then(setSavedReports);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleApplyReport = (report: SavedReport) => {
    const params = new URLSearchParams();
    if (report.filters.from) params.set("from", report.filters.from);
    if (report.filters.to) params.set("to", report.filters.to);
    if (report.filters.categoryIds) {
      report.filters.categoryIds.forEach((id: number) => params.append("categoryId", String(id)));
    }
    router.push(`/reports?${params.toString()}`);
    toast.info(`Filter dari laporan "${report.name}" diterapkan.`);
  };

  const handleDeleteReport = async (id: number) => {
    try {
      await deleteSavedReport(id);
      toast.success("Laporan berhasil dihapus.");
      // Refresh the list
      setSavedReports(reports => reports.filter(r => r.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Simpan Laporan Ini
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Simpan Laporan Kustom</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <Label htmlFor="report-name">Nama Laporan</Label>
                    <Input 
                        id="report-name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder='Contoh: "Laporan Bulanan Makanan"'
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Batal</Button>
                    </DialogClose>
                    <Button onClick={handleSaveReport}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {savedReports.length > 0 && (
            <div className="space-y-2 pt-4">
                <h4 className="font-medium">Laporan Tersimpan</h4>
                <div className="flex flex-wrap gap-2">
                    {savedReports.map(report => (
                        <div key={report.id} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-1 py-1 text-sm">
                            <button onClick={() => handleApplyReport(report)} className="hover:underline">
                                {report.name}
                            </button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleDeleteReport(report.id)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
