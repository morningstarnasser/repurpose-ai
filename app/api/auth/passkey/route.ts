import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPasskeysByEmail, deletePasskey } from "@/lib/passkey";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const passkeys = await getPasskeysByEmail(session.user.email);
    return NextResponse.json(
      passkeys.map((pk) => ({
        credential_id: pk.credential_id,
        name: pk.name,
        device_type: pk.device_type,
        backed_up: pk.backed_up,
        created_at: pk.created_at,
      }))
    );
  } catch (error) {
    console.error("Passkey list error:", error);
    return NextResponse.json({ error: "Failed to list passkeys" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { credential_id } = await req.json();
    if (!credential_id) {
      return NextResponse.json({ error: "Missing credential_id" }, { status: 400 });
    }

    const deleted = await deletePasskey(credential_id, session.user.email);
    if (!deleted) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Passkey delete error:", error);
    return NextResponse.json({ error: "Failed to delete passkey" }, { status: 500 });
  }
}
