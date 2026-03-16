import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserRepurposes } from "@/lib/repurpose";
import DashboardNav from "@/components/DashboardNav";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const repurposes = await getUserRepurposes(user.email!);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav user={user} />
      <DashboardClient repurposes={repurposes} userName={user.name?.split(" ")[0] || "there"} />
    </div>
  );
}
