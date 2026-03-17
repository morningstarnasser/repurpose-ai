import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserRepurposes, getUserPlan } from "@/lib/repurpose";
import DashboardNav from "@/components/DashboardNav";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const [repurposes, userPlan] = await Promise.all([
    getUserRepurposes(user.email!),
    getUserPlan(user.email!),
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav user={user} plan={userPlan.plan} />
      <DashboardClient
        repurposes={repurposes}
        userName={user.name?.split(" ")[0] || "there"}
        plan={userPlan.plan}
        usageCount={userPlan.repurpose_count}
      />
    </div>
  );
}
