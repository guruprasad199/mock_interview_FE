"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth, db } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  User,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";
import {
  Github,
  Mail,
  Apple,
  Chrome,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { trackSignUp, trackSignIn } from "@/lib/firebase-analytics";

/* =========================
   SCHEMAS (STATIC & SAFE)
========================= */

const signUpSchema = z.object({
  name: z.string().min(3, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;
type SignInValues = z.infer<typeof signInSchema>;

type AuthFormProps = {
  type: "sign-in" | "sign-up";
};

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const syncServerSession = async (user: User) => {
    const idToken = await user.getIdToken(true);

    const response = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || "Failed to create server session.");
    }
  };

  const form = useForm<SignUpValues | SignInValues>({
    resolver: zodResolver(isSignIn ? signInSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignIn ? {} : { name: "" }),
    },
  });

  // Handle user data storage for OAuth
  const storeUserData = async (user: any) => {
    if (!db) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || null,
          authProvider: user.providerData[0]?.providerId || "email",
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  // OAuth Login Functions
  const handleGoogleLogin = async () => {
    if (!auth || !db) {
      toast.error("Firebase client env vars are missing in this deployment.");
      return;
    }

    setSocialLoading("google");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await storeUserData(result.user);
      await syncServerSession(result.user);
      trackSignIn("google");
      toast.success("Signed in with Google!");
      router.push("/");
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error?.message || "Google login failed");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    if (!auth || !db) {
      toast.error("Firebase client env vars are missing in this deployment.");
      return;
    }

    setSocialLoading("github");
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await storeUserData(result.user);
      await syncServerSession(result.user);
      trackSignIn("github");
      toast.success("Signed in with GitHub!");
      router.push("/");
    } catch (error: any) {
      console.error("GitHub login error:", error);
      toast.error(error?.message || "GitHub login failed");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    if (!auth || !db) {
      toast.error("Firebase client env vars are missing in this deployment.");
      return;
    }

    setSocialLoading("apple");
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      const result = await signInWithPopup(auth, provider);
      await storeUserData(result.user);
      await syncServerSession(result.user);
      trackSignIn("apple");
      toast.success("Signed in with Apple!");
      router.push("/");
    } catch (error: any) {
      console.error("Apple login error:", error);
      toast.error(error?.message || "Apple login failed");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!auth || !db) {
      toast.error("Firebase client env vars are missing in this deployment.");
      return;
    }

    setSocialLoading("microsoft");
    try {
      const provider = new OAuthProvider("microsoft.com");
      provider.addScope("email");
      provider.addScope("profile");
      const result = await signInWithPopup(auth, provider);
      await storeUserData(result.user);
      await syncServerSession(result.user);
      trackSignIn("microsoft");
      toast.success("Signed in with Microsoft!");
      router.push("/");
    } catch (error: any) {
      console.error("Microsoft login error:", error);
      toast.error(error?.message || "Microsoft login failed");
    } finally {
      setSocialLoading(null);
    }
  };

  const onSubmit = async (data: SignUpValues | SignInValues) => {
    if (!auth || !db) {
      toast.error("Firebase client env vars are missing in this deployment.");
      return;
    }

    setIsLoading(true);
    try {
      /* =========================
         SIGN UP
      ========================= */
      if (!isSignIn) {
        const { name, email, password } = data as SignUpValues;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const uid = userCredential.user.uid;

        // Store user in Firestore
        await setDoc(doc(db, "users", uid), {
          uid,
          name,
          email,
          photoURL: null,
          authProvider: "email",
          createdAt: new Date(),
        });

        trackSignUp("email");
        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
        return;
      }

      /* =========================
         SIGN IN
      ========================= */
      const { email, password } = data as SignInValues;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Optional: ensure user doc exists
      const userDoc = await getDoc(
        doc(db, "users", userCredential.user.uid)
      );

      if (!userDoc.exists()) {
        toast.error("User record not found.");
        return;
      }

      await syncServerSession(userCredential.user);

      trackSignIn("email");
      toast.success("Signed in successfully.");
      router.push("/");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-border lg:min-w-[566px] relative">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 p-2 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-900/50 transition-all duration-200 cursor-pointer z-10"
        aria-label="Go back to home"
      >
        <ArrowLeft className="w-5 h-5 text-gray-300 hover:text-gray-100" />
      </button>
      <div className="flex flex-col gap-6 card py-14 px-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo" height={32} width={38} />
            <h2 className="text-primary-100">PrepWise</h2>
          </div>
          <p className="text-center text-sm text-gray-400">
            Practice job interviews with AI
          </p>
        </div>

        {/* Email Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4 mt-2"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your full name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="your@email.com"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              type="password"
            />

            <Button
              className="btn w-full mt-6 cursor-pointer disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || socialLoading !== null}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignIn ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {isSignIn ? "Sign In with Email" : "Create Account"}
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || socialLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-900/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Chrome className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium hidden sm:inline">Google</span>
              </>
            )}
          </button>

          {/* GitHub */}
          <button
            onClick={handleGithubLogin}
            disabled={isLoading || socialLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-900/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === "github" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Github className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-medium hidden sm:inline">GitHub</span>
              </>
            )}
          </button>

          {/* Apple */}
          <button
            onClick={handleAppleLogin}
            disabled={isLoading || socialLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-900/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === "apple" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Apple className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-medium hidden sm:inline">Apple</span>
              </>
            )}
          </button>

          {/* Microsoft */}
          <div className="relative">
            <button
              onClick={handleMicrosoftLogin}
              disabled={true}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:border-gray-600 bg-gray-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">Microsoft</span>
            </button>
            <span className="absolute -top-2 -right-2 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Sign In / Sign Up Link */}
        <p className="text-center text-sm">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-semibold text-user-primary ml-2 hover:underline transition cursor-pointer"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>

        {/* Terms of Service */}
        <p className="text-center text-xs text-gray-400">
          By signing in, you agree to our
          <Link href="#" className="text-user-primary hover:underline ml-1 cursor-pointer">
            Terms of Service
          </Link>
          {" "}and
          <Link href="#" className="text-user-primary hover:underline ml-1 cursor-pointer">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
