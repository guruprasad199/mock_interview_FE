"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/firebase/client";
import { trackAppSession } from "@/lib/firebase-analytics";

/**
 * Component to track app session when user is logged in
 * Place this in the root layout for authenticated users
 */
export const AppSessionTracker = () => {
    useEffect(() => {
        // Track app session when user enters the app
        trackAppSession();

        // Optional: Track session duration (in seconds)
        const sessionStart = Date.now();
        return () => {
            const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);
            trackAppSession(sessionDuration);
        };
    }, []);

    useEffect(() => {
        if (!auth) {
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (!firebaseUser) {
                    await fetch("/api/session", { method: "DELETE" });
                    return;
                }

                const idToken = await firebaseUser.getIdToken();

                await fetch("/api/session", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ idToken }),
                });
            } catch (error) {
                console.error("Failed to sync app session", error);
            }
        });

        return () => unsubscribe();
    }, []);

    return null; // This component doesn't render anything
};
