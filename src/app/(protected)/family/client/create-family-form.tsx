"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createFamily } from "@/lib/actions/family.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Membuat..." : "Buat Keluarga"}
    </Button>
  );
}

export function CreateFamilyForm() {
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    const name = formData.get("name") as string;
    try {
      await createFamily(name);
      return { success: true, message: "Keluarga berhasil dibuat!" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }, null);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Buat Keluarga Baru</CardTitle>
        <CardDescription>
          Buat sebuah grup untuk berbagi data keuangan dengan anggota keluarga atau tim Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name">Nama Keluarga</label>
            <Input
              id="name"
              name="name"
              placeholder='Contoh: "Keluarga Hebat"'
              required
            />
          </div>
          <SubmitButton />
          {state?.message && (
            <p className={state.success ? "text-green-600" : "text-red-600"}>
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
