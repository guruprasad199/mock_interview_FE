"use client";

import { useEffect } from "react";
import { trackPageView, trackAboutPageView, trackCareersPageView, trackPricingPageView } from "@/lib/firebase-analytics";

interface PageViewTrackerProps {
    pageName: string;
    pageTitle?: string;
}

/**
 * Component to track page views for different pages
 * Use this at the top of any page that needs tracking
 */
export const PageViewTracker = ({ pageName, pageTitle }: PageViewTrackerProps) => {
    useEffect(() => {
        trackPageView(pageName, pageTitle || pageName);
    }, [pageName, pageTitle]);

    return null; // This component doesn't render anything
};

/**
 * Convenience component for tracking the About page
 */
export const AboutPageTracker = () => {
    useEffect(() => {
        trackAboutPageView();
    }, []);

    return null;
};

/**
 * Convenience component for tracking the Careers page
 */
export const CareersPageTracker = () => {
    useEffect(() => {
        trackCareersPageView();
    }, []);

    return null;
};

/**
 * Convenience component for tracking the Pricing page
 */
export const PricingPageTracker = () => {
    useEffect(() => {
        trackPricingPageView();
    }, []);

    return null;
};
