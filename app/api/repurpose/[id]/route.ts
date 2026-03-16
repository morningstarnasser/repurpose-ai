import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRepurpose } from "@/lib/repurpose";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await getRepurpose(id);
  if (!item || item.user_email !== session.user.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
