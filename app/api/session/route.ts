export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// 7 days
const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    const { getAdminAuth } = await import("@/firebase/admin");
    const auth = getAdminAuth();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: "Missing ID token" },
        { status: 400 }
      );
    }

    // Create Firebase session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION * 1000,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("🔥 Firebase session error:", error?.message || error);

    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
