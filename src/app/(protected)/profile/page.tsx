import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Profil Pengguna</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${session.name}`}
                alt={session.name}
              />
              <AvatarFallback>{getInitials(session.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{session.name}</CardTitle>
            <CardDescription>{session.email}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Additional profile information can go here */}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
            <CardDescription>
              Pengaturan akun dan preferensi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Segera Hadir
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
