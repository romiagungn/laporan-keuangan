import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { Header } from "@/components/shareds/header";
import { SheetProvider } from "@/components/providers/sheet-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <SheetProvider />
      <Header session={null} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
