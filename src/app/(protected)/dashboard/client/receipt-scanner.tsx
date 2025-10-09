"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";

interface ReceiptScannerProps {
  children: React.ReactNode;
  onScanSuccess: (data: { amount: number | null; date: Date | null; description: string | null }) => void;
}

export function ReceiptScanner({ children, onScanSuccess }: ReceiptScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!file) {
      toast.error("Please select a file to scan.");
      return;
    }

    setIsScanning(true);
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Scan failed on the server.");
      }

      const result = await response.json();

      toast.success("Receipt scanned successfully!");
      onScanSuccess({
        ...result,
        date: result.date ? new Date(result.date) : null, // Ensure date is a Date object
      });
      setIsOpen(false);

    } catch (error) {
      console.error("Scan failed:", error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload an image of your receipt to automatically fill in the expense details.
          </p>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {file && <p className="text-xs text-center">Selected: {file.name}</p>}
        </div>
        <Button onClick={handleScan} disabled={isScanning || !file}>
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <ScanLine className="mr-2 h-4 w-4" />
              Start Scan
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}