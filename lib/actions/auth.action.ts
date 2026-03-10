"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

/**
 * Session duration (1 week)
 */
const SESSION_DURATION = 60 * 60 * 24 * 7;

/**
 * Set session cookie
 */
export async function setSessionCookie(idToken: string) {
  const cookieStore = cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/", // ✅ VERY IMPORTANT
  });
}

/**
 * Sign up user (Firestore profile creation)
 */
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    if (!uid || !email) {
      return {
        success: false,
        message: "Invalid signup data",
      };
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    await userRef.set({
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("🔥 Firestore signup error:", error);
    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

/**
 * Sign in user (session cookie)
 */
export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    if (!email || !idToken) {
      return {
        success: false,
        message: "Invalid sign-in data",
      };
    }

    await auth.getUserByEmail(email);
    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    console.error("🔥 Sign-in error:", error);
    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  const cookieStore = cookies();

  // ✅ Proper delete (path must match)
  cookieStore.set("session", "", {
    maxAge: 0,
    path: "/",
  });
}

/**
 * Get current logged-in user
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    // ❌ Removed revocation check (stable)
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);

    const userSnap = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userSnap.exists) return null;

    return {
      id: userSnap.id,
      ...(userSnap.data() as Omit<User, "id">),
    };
  } catch (error) {
    console.error("🔥 Session verification failed:", error);
    return null;
  }
}

/**
 * Check authentication
 */
export async function isAuthenticated() {
  return Boolean(await getCurrentUser());
}
