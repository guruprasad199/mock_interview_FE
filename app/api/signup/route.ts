export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const { uid, name, email } = await req.json();
    const db = getAdminDb();

    if (!uid || !email) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      });
    }

    await userRef.set({
      name: name || "",
      email,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("🔥 signup API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
