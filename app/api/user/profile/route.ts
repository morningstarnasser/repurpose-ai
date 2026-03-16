import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "@/lib/repurpose";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await getUserProfile(session.user.email);
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, image, preferences } = body;

  // Validate image size (max 100KB base64)
  if (image && image.length > 140000) {
    return NextResponse.json({ error: "Image too large. Max 100KB." }, { status: 400 });
  }

  await updateUserProfile(session.user.email, { name, image, preferences });
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteUserAccount(session.user.email);
  return NextResponse.json({ success: true });
}
