import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserRepurposes } from "@/lib/repurpose";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await getUserRepurposes(session.user.email);

  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const rows: string[] = ["Title,Platform,Format,Content,Tone,Created"];
  for (const item of items) {
    for (const output of item.outputs) {
      rows.push([esc(item.title), esc(output.platform), esc(output.format), esc(output.content), esc((item as unknown as Record<string, unknown>).tone as string || "professional"), esc(item.created_at)].join(","));
    }
  }

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="repurpose-export-${Date.now()}.csv"`,
    },
  });
}
