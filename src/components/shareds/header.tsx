"use client";

import { usePathname, useRouter } from "next/navigation";
import { CircleUser, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface UserPayload {
  userId: string;
  name: string;
  email: string;
}

interface UserNavProps {
  session: UserPayload | null;
}

export function Header({ session }: UserNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.push("/login");
      router.refresh();
    } else {
      console.error("Logout failed");
      alert("Logout gagal. Silakan coba lagi.");
    }
  };

  const commonLinkClasses = "transition-colors hover:text-foreground";
  const activeLinkClasses = "text-foreground font-bold";
  const inactiveLinkClasses = "text-muted-foreground";

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Wallet className="h-6 w-6 text-primary" />
          <span className="sr-only">Rekap Pengeluaran</span>
        </Link>
        <Link
          href="/dashboard"
          className={`${commonLinkClasses} ${
            pathname === "/dashboard" ? activeLinkClasses : inactiveLinkClasses
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/reports"
          className={`${commonLinkClasses} ${
            pathname === "/reports" ? activeLinkClasses : inactiveLinkClasses
          }`}
        >
          Laporan
        </Link>
        <Link
          href="/incomes"
          className={`${commonLinkClasses} ${
            pathname === "/incomes" ? activeLinkClasses : inactiveLinkClasses
          }`}
        >
          Pemasukan
        </Link>
        <Link
          href="/budgets"
          className={`${commonLinkClasses} ${
            pathname === "/budgets" ? activeLinkClasses : inactiveLinkClasses
          }`}
        >
          Anggaran
        </Link>
        <Link
          href="/categories"
          className={`${commonLinkClasses} ${
            pathname === "/categories" ? activeLinkClasses : inactiveLinkClasses
          }`}
        >
          Kategori
        </Link>
        <Link
          href="/recurring"
          className={`${commonLinkClasses} ${
            pathname === "/recurring" ? activeLinkClasses : inactiveLinkClasses
          }`}
        >
          Transaksi Berulang
        </Link>
        <Link
          href="/family"
          className={`${commonLinkClasses} ${
            pathname === "/family" ? activeLinkClasses : inactiveLinkClasses
          }`}
        >
          Keluarga
        </Link>
        <Link
          href="#"
          className={`${commonLinkClasses} ${inactiveLinkClasses}`}
        >
          Pengaturan
        </Link>
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial"></div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Buka menu pengguna</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {session?.name || "Akun Saya"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>Pengaturan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
