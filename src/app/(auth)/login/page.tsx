import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Selamat Datang Kembali
          </h1>
          <p className="text-gray-500">
            Silakan masuk untuk melanjutkan ke dashboard Anda.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
