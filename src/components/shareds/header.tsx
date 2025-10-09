"use client";

import { usePathname, useRouter } from "next/navigation";
import { CircleUser, Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reports", label: "Laporan" },
    { href: "/incomes", label: "Pemasukan" },
    { href: "/budgets", label: "Anggaran" },
    { href: "/categories", label: "Kategori" },
    { href: "/recurring", label: "Transaksi Berulang" },
    { href: "/family", label: "Keluarga" },
    // { href: "#", label: "Pengaturan" }, // Example for a disabled link
  ];

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
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`${commonLinkClasses} ${
              pathname === link.href ? activeLinkClasses : inactiveLinkClasses
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Buka menu navigasi</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Wallet className="h-6 w-6 text-primary" />
              <span className="sr-only">Rekap Pengeluaran</span>
            </Link>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${commonLinkClasses} ${
                  pathname === link.href ? activeLinkClasses : inactiveLinkClasses
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

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
