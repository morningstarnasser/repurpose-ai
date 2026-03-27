import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRegistrationOptions } from "@/lib/passkey";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const options = await createRegistrationOptions(session.user.email);
    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey register-options error:", error);
    return NextResponse.json({ error: "Failed to generate options" }, { status: 500 });
  }
}
