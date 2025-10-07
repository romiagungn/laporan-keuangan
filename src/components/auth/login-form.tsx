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

const LoginSchema = z.object({
  email: z.string().email({ message: "Harap masukkan email yang valid." }),
  password: z.string().min(1, { message: "Password tidak boleh kosong." }),
});

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        console.log('data =>', data)
        console.log('data =>', response)

        if (response.ok) {
          toast({
            title: "Login Berhasil!",
            description: "Anda akan diarahkan ke dashboard.",
          });
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
          toast({
            variant: "destructive",
            title: "Login Gagal",
            description: data.error || "Kredensial tidak valid.",
          });
        }
      } catch (e) {
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
        {error && (
          <p className="text-sm text-red-500 font-medium text-center">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full h-10" disabled={isPending}>
          {isPending ? "Memproses..." : "Masuk"}
        </Button>
        <div className="mt-4 text-center text-sm">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="underline font-semibold text-primary hover:text-primary/90"
          >
            Daftar di sini
          </Link>
        </div>
      </form>
    </Form>
  );
}
