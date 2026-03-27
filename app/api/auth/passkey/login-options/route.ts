import { NextResponse } from "next/server";
import { createAuthenticationOptions } from "@/lib/passkey";

export async function POST() {
  try {
    const options = await createAuthenticationOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey login-options error:", error);
    return NextResponse.json({ error: "Failed to generate options" }, { status: 500 });
  }
}
