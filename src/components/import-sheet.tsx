"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { z } from "zod";
// import { addMultipleExpenses } from "@/lib/actions";
import { Upload, File, Send, X } from "lucide-react";

interface ImportSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseImportSchema = z.object({
  date: z.coerce.date({
    error: () => ({ message: "Format tanggal tidak valid." }),
  }),
  category: z.string().min(1, "Kategori tidak boleh kosong."),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0."),
  payment_method: z.string().min(1, "Metode pembayaran tidak boleh kosong."),
  description: z.string().optional().nullable(),
});

type ParsedExpense = z.infer<typeof ExpenseImportSchema>;

export function ImportSheet({ isOpen, onClose }: ImportSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (fileToParse: File) => {
    setIsLoading(true);
    setProgress(30);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let jsonData: any[] = [];
        if (fileToParse.name.endsWith(".csv")) {
          const result = Papa.parse(data as string, {
            header: true,
            skipEmptyLines: true,
          });
          jsonData = result.data;
        } else if (
          fileToParse.name.endsWith(".xlsx") ||
          fileToParse.name.endsWith(".xls")
        ) {
          const workbook = XLSX.read(data, { type: "binary", cellDates: true });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
          throw new Error("Tipe file tidak didukung.");
        }

        setProgress(70);

        const validatedData = jsonData
          .map((row, index) => {
            const result = ExpenseImportSchema.safeParse(row);
            if (!result.success) {
              console.error(
                `Error di baris ${index + 2}:`,
                result.error.flatten().fieldErrors,
              );
              return null;
            }
            return result.data;
          })
          .filter(Boolean) as ParsedExpense[];

        if (validatedData.length === 0 && jsonData.length > 0) {
          throw new Error(
            "Tidak ada data yang valid ditemukan. Periksa nama kolom (date, category, amount, payment_method) dan format data Anda.",
          );
        }

        setParsedData(validatedData);
        setProgress(100);
        toast({
          title: "File berhasil diproses",
          description: `${validatedData.length} baris data siap untuk diimpor.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Gagal memproses file",
          description:
            error.message || "Terjadi kesalahan yang tidak diketahui.",
        });
        resetState();
      } finally {
        setIsLoading(false);
      }
    };

    if (fileToParse.name.endsWith(".csv")) {
      reader.readAsText(fileToParse);
    } else {
      reader.readAsBinaryString(fileToParse);
    }
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) {
      toast({
        variant: "destructive",
        title: "Tidak ada data",
        description: "Tidak ada data valid untuk diimpor.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // await addMultipleExpenses(parsedData);
      toast({
        title: "Impor Berhasil!",
        description: `${parsedData.length} data pengeluaran baru telah ditambahkan.`,
      });
      resetState();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Impor Gagal",
        description: "Gagal menyimpan data ke database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setProgress(0);
    const fileInput = document.getElementById(
      "file-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-3xl flex flex-col">
        <SheetHeader>
          <SheetTitle>Impor Data Pengeluaran</SheetTitle>
          <SheetDescription>
            Unggah file CSV atau XLSX. Pastikan kolom sesuai: date, category,
            amount, payment_method, description (opsional).
          </SheetDescription>
        </SheetHeader>

        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Tarik file ke sini atau klik untuk memilih file
            </p>
            <Label
              htmlFor="file-upload"
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Pilih File
            </Label>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5 text-primary" />
                <span className="font-medium truncate">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={resetState}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isLoading && <Progress value={progress} className="w-full mb-4" />}

            <p className="text-sm font-semibold mb-2">
              Pratinjau Data ({parsedData.length} baris valid)
            </p>
            <div className="overflow-auto border rounded-lg flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.date.toLocaleDateString()}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.payment_method}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(row.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {parsedData.length > 10 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        ...dan {parsedData.length - 10} baris lainnya.
                      </TableCell>
                    </TableRow>
                  )}
                  {parsedData.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Tidak ada data valid untuk ditampilkan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <SheetFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || parsedData.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Simpan {parsedData.length > 0 ? `${parsedData.length} Data` : ""}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
