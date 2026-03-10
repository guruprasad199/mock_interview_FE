"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth, db } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";

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

  const form = useForm<SignUpValues | SignInValues>({
    resolver: zodResolver(isSignIn ? signInSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignIn ? {} : { name: "" }),
    },
  });

  const onSubmit = async (data: SignUpValues | SignInValues) => {
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
          createdAt: new Date(),
        });

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

      toast.success("Signed in successfully.");
      router.push("/");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error?.message || "Something went wrong");
    }
  };

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn w-full" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-1"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
