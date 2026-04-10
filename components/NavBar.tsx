"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, X } from "lucide-react";

import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            await fetch("/api/session", { method: "DELETE" });
            setMobileMenuOpen(false);
            router.push("/sign-in");
            return;
        }

        await signOut(auth);
        await fetch("/api/session", { method: "DELETE" });
        setMobileMenuOpen(false);
        router.push("/sign-in");
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="border-b bg-black">
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                        closeMobileMenu();
                        router.push("/");
                    }}
                >
                    <Image src="/logo.svg" alt="logo" width={32} height={32} />
                    <span className="font-bold text-lg text-primary-100">
                        PrepWise
                    </span>
                </div>

                {!loading && (
                    <>
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => router.push("/")}
                                        className="font-medium text-white hover:underline"
                                    >
                                        Dashboard
                                    </button>

                                    <button
                                        onClick={() => router.push("/interview?autostart=1")}
                                        className="font-medium text-white hover:underline"
                                    >
                                        Schedule Interview
                                    </button>

                                    <Button variant="outline" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/#features"
                                        className="font-medium text-white hover:underline"
                                    >
                                        Features
                                    </Link>

                                    <Link
                                        href="/#pricing"
                                        className="font-medium text-white hover:underline"
                                    >
                                        Pricing
                                    </Link>

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

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="md:hidden inline-flex items-center justify-center rounded-md border border-gray-700 p-2 text-white"
                            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </>
                )}
            </div>

            {!loading && mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-800 px-4 pb-4 pt-3">
                    <div className="flex flex-col gap-3">
                        {user ? (
                            <>
                                <button
                                    onClick={() => {
                                        closeMobileMenu();
                                        router.push("/");
                                    }}
                                    className="w-full rounded-md border border-gray-700 px-3 py-2 text-left font-medium text-white"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        closeMobileMenu();
                                        router.push("/interview?autostart=1");
                                    }}
                                    className="w-full rounded-md border border-gray-700 px-3 py-2 text-left font-medium text-white"
                                >
                                    Schedule Interview
                                </button>
                                <Button variant="outline" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/#features"
                                    className="w-full rounded-md border border-gray-700 px-3 py-2 text-left font-medium text-white"
                                    onClick={closeMobileMenu}
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/#pricing"
                                    className="w-full rounded-md border border-gray-700 px-3 py-2 text-left font-medium text-white"
                                    onClick={closeMobileMenu}
                                >
                                    Pricing
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full justify-center"
                                    onClick={() => {
                                        closeMobileMenu();
                                        router.push("/sign-in");
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    className="w-full bg-primary text-primary-foreground font-semibold hover:opacity-90"
                                    onClick={() => {
                                        closeMobileMenu();
                                        router.push("/sign-up");
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
