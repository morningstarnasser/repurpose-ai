import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyRegistration } from "@/lib/passkey";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { response, name } = await req.json();
    if (!response) {
      return NextResponse.json({ error: "Missing response" }, { status: 400 });
    }

    const result = await verifyRegistration(response, session.user.email, name);
    if (!result.verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, credential_id: result.credentialId });
  } catch (error) {
    console.error("Passkey register-verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
