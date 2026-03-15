"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 🔥 Prefetch routes for INSTANT navigation
    useEffect(() => {
        router.prefetch("/sign-in");
        router.prefetch("/sign-up");
        router.prefetch("/interview");
    }, [router]);

    const handleLogout = async () => {
        if (!auth) {
            router.push("/sign-in");
            return;
        }

        await signOut(auth);
        router.push("/sign-in");
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b bg-black">
            {/* Logo */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/")}
            >
                <Image src="/logo.svg" alt="logo" width={32} height={32} />
                <span className="font-bold text-lg text-primary-100">
                    PrepWise
                </span>
            </div>

            {!loading && (
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <button
                                onClick={() => router.push("/interview")}
                                className="font-medium text-white hover:underline"
                            >
                                Interviews
                            </button>

                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/sign-in")}
                            >
                                Sign In
                            </Button>

                            <Button
                                className="btn-primary"
                                onClick={() => router.push("/sign-up")}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
