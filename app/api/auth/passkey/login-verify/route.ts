import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/lib/passkey";

export async function POST(req: NextRequest) {
  try {
    const response = await req.json();
    if (!response?.id) {
      return NextResponse.json({ error: "Missing response" }, { status: 400 });
    }

    const result = await verifyAuthentication(response);
    if (!result) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    return NextResponse.json({ verified: true, token: result.token });
  } catch (error) {
    console.error("Passkey login-verify error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
