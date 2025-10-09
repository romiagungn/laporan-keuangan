import { getFinancialGoals } from "@/lib/actions/goal.actions";
import { GoalClient } from "./client/goal-client";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await getFinancialGoals();

  return (
    <div className="container mx-auto py-10">
      <GoalClient goals={goals} />
    </div>
  );
}
