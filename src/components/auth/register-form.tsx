"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const RegisterSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter." }),
  email: z.string().email({ message: "Harap masukkan email yang valid." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
  family: z.string().min(3, { message: "Nama keluarga minimal 3 karakter." }),
});

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      family: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Registrasi Berhasil!",
            description: "Akun Anda telah dibuat. Silakan login.",
          });
          router.push("/login");
        } else {
          setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
          toast({
            variant: "destructive",
            title: "Registrasi Gagal",
            description: data.error || "Gagal membuat akun.",
          });
        }
      } catch (e) {
        console.error(e)
        setError("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        toast({
          variant: "destructive",
          title: "Koneksi Gagal",
          description: "Tidak dapat terhubung ke server.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-card p-8 shadow-lg rounded-lg border"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="John Doe"
                  disabled={isPending}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="nama@email.com"
                  disabled={isPending}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="family"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keluarga</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nama Keluarga"
                  disabled={isPending}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <p className="text-sm text-red-500 font-medium text-center">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full h-10" disabled={isPending}>
          {isPending ? "Memproses..." : "Daftar"}
        </Button>
        <div className="mt-4 text-center text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="underline font-semibold text-primary hover:text-primary/90"
          >
            Masuk di sini
          </Link>
        </div>
      </form>
    </Form>
  );
}
