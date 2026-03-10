"use client";

import { useEffect } from "react";
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

    return null; // This component doesn't render anything
};
