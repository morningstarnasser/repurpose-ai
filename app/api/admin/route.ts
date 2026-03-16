import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, getAdminStats, getAllUsers, updateUserPlan, resetUserCount, deleteUser, getAllRepurposes, deleteRepurpose, deleteBlogPost, getBillingStats, getAnalytics } from "@/lib/admin";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") || "stats";

  if (section === "stats") {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  }

  if (section === "users") {
    const page = Number(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const data = await getAllUsers(page, 20, search);
    return NextResponse.json(data);
  }

  if (section === "repurposes") {
    const page = Number(searchParams.get("page") || "1");
    const data = await getAllRepurposes(page, 20);
    return NextResponse.json(data);
  }

  if (section === "blog") {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  }

  if (section === "billing") {
    const billing = await getBillingStats();
    return NextResponse.json(billing);
  }

  if (section === "analytics") {
    const analytics = await getAnalytics();
    return NextResponse.json(analytics);
  }

  return NextResponse.json({ error: "Invalid section" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action } = body;

  if (action === "updatePlan") {
    await updateUserPlan(body.email, body.plan);
    return NextResponse.json({ success: true });
  }

  if (action === "resetCount") {
    await resetUserCount(body.email);
    return NextResponse.json({ success: true });
  }

  if (action === "deleteUser") {
    await deleteUser(body.email);
    return NextResponse.json({ success: true });
  }

  if (action === "deleteRepurpose") {
    await deleteRepurpose(body.id);
    return NextResponse.json({ success: true });
  }

  if (action === "deleteBlogPost") {
    await deleteBlogPost(body.slug);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
