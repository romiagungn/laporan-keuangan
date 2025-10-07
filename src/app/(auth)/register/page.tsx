import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Buat Akun Baru
          </h1>
          <p className="text-gray-500">Isi form di bawah ini untuk memulai.</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
