import { getFamilyDetails } from "@/lib/actions/family.actions";
import { getUserSession } from "@/lib/session";
import { CreateFamilyForm } from "./client/create-family-form";
import { FamilyDashboard } from "./client/family-dashboard";

export default async function FamilyPage() {
  const session = await getUserSession();
  const familyDetails = await getFamilyDetails();

  const userId = session?.userId ? parseInt(session.userId) : null;

  if (!userId) {
    return <p>Otentikasi diperlukan.</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Manajemen Keluarga</h1>
      {
        !familyDetails ? (
          <CreateFamilyForm />
        ) : (
          <FamilyDashboard family={familyDetails} userId={userId} />
        )
      }
    </div>
  );
}
