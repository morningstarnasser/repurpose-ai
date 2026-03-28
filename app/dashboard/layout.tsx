import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/repurpose";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let plan = "free";
  try {
    const userPlan = await getUserPlan(session.user.email!);
    plan = userPlan.plan;
  } catch {
    // Fall back to free plan
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardSidebar user={session.user} plan={plan} />
      {/* Main content: offset for sidebar on desktop, offset for mobile header */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
