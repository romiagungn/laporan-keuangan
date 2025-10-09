"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  addMemberByEmail,
  removeMember,
  leaveFamily,
} from "@/lib/actions/family.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

type Family = {
  id: number;
  name: string;
  ownerId: number;
  owner: {
    id: number;
    name: string | null;
    email: string;
  };
  members: {
    id: number;
    name: string | null;
    email: string;
  }[];
};

function AddMemberButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Menambah..." : "Tambah Anggota"}</Button>;
}

function RemoveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="destructive" size="sm" disabled={pending}>{pending ? "Menghapus..." : "Hapus"}</Button>;
}

function LeaveButton() {
  const { pending } = useFormStatus();
  return <Button variant="outline" type="submit" disabled={pending}>{pending ? "Keluar..." : "Keluar dari Keluarga"}</Button>;
}

// --- Forms for Actions ---
function AddMemberForm({ familyId }: { familyId: number }) {
  const [state, formAction] = useFormState(async (p: any, f: FormData) => {
    const email = f.get("email") as string;
    try {
      await addMemberByEmail({ email, familyId });
      toast.success("Anggota berhasil ditambahkan!");
      return { success: true, message: "" };
    } catch (e: any) {
      toast.error(e.message);
      return { success: false, message: e.message };
    }
  }, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Input name="email" type="email" placeholder="Email anggota baru" required className="max-w-xs" />
      <AddMemberButton />
    </form>
  );
}

function RemoveMemberForm({ memberId, familyId }: { memberId: number; familyId: number }) {
  return (
    <form action={async () => {
      try {
        await removeMember({ memberId, familyId });
        toast.success("Anggota berhasil dihapus.");
      } catch (e: any) {
        toast.error(e.message);
      }
    }}>
      <RemoveButton />
    </form>
  );
}

function LeaveFamilyForm() {
  return (
    <form action={async () => {
      try {
        await leaveFamily();
        toast.success("Anda telah keluar dari keluarga.");
      } catch (e: any) {
        toast.error(e.message);
      }
    }}>
      <LeaveButton />
    </form>
  );
}

export function FamilyDashboard({ family, userId }: { family: Family; userId: number }) {
  const isOwner = family.ownerId === userId;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{`Keluarga "${family.name}"`}</CardTitle>
          {family.owner && <CardDescription>Dimiliki oleh: {family.owner.name || family.owner.email}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">Anggota</h3>
          <div className="space-y-3">
            {family.members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{(member.name || member.email).substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                {isOwner && member.id !== userId && (
                  <RemoveMemberForm memberId={member.id} familyId={family.id} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Anggota Baru</CardTitle>
            <CardDescription>Undang pengguna lain ke keluarga Anda menggunakan alamat email mereka.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddMemberForm familyId={family.id} />
          </CardContent>
        </Card>
      )}

      {!isOwner && (
         <Card>
          <CardHeader>
            <CardTitle>Keluar dari Keluarga</CardTitle>
            <CardDescription>Jika Anda keluar, Anda tidak akan lagi memiliki akses ke data bersama.</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaveFamilyForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
