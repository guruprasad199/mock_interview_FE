import { logEvent } from "firebase/analytics";
import { analytics } from "@/firebase/client";

/**
 * Track user events in Firebase Analytics
 * All events should use this utility for consistency
 */

// Page View Events
export const trackPageView = (pageName: string, pageTitle?: string) => {
    if (!analytics) return;
    logEvent(analytics!, "page_view", {
        page_name: pageName,
        page_title: pageTitle || pageName,
        timestamp: new Date().toISOString(),
    });
};

// Authentication Events
export const trackSignUp = (method: "email" | "google" | "github" | "apple" | "microsoft") => {
    if (!analytics) return;
    logEvent(analytics!, "sign_up", {
        method: method,
        timestamp: new Date().toISOString(),
    });
};

export const trackSignIn = (method: "email" | "google" | "github" | "apple" | "microsoft") => {
    if (!analytics) return;
    logEvent(analytics!, "login", {
        method: method,
        timestamp: new Date().toISOString(),
    });
};

export const trackSignOut = () => {
    if (!analytics) return;
    logEvent(analytics!, "logout", {
        timestamp: new Date().toISOString(),
    });
};

// Interview Events
export const trackInterviewStart = (roleType?: string) => {
    if (!analytics) return;
    logEvent(analytics!, "interview_start", {
        role_type: roleType || "general",
        timestamp: new Date().toISOString(),
    });
};

export const trackInterviewComplete = (roleType?: string, duration?: number) => {
    if (!analytics) return;
    logEvent(analytics!, "interview_complete", {
        role_type: roleType || "general",
        duration_minutes: duration || 0,
        timestamp: new Date().toISOString(),
    });
};

export const trackInterviewFeedback = (rating: number) => {
    if (!analytics) return;
    logEvent(analytics!, "interview_feedback", {
        rating: rating,
        timestamp: new Date().toISOString(),
    });
};

// Feature Usage Events
export const trackFeatureUsage = (featureName: string, details?: Record<string, any>) => {
    if (!analytics) return;
    logEvent(analytics!, "feature_usage", {
        feature_name: featureName,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

export const trackResumeUpload = (fileSize?: number) => {
    if (!analytics) return;
    logEvent(analytics!, "resume_upload", {
        file_size_bytes: fileSize || 0,
        timestamp: new Date().toISOString(),
    });
};

export const trackSkillsExtracted = (skillCount?: number) => {
    if (!analytics) return;
    logEvent(analytics!, "skills_extracted", {
        skill_count: skillCount || 0,
        timestamp: new Date().toISOString(),
    });
};

// User Engagement Events
export const trackButtonClick = (buttonName: string) => {
    if (!analytics) return;
    logEvent(analytics!, "button_click", {
        button_name: buttonName,
        timestamp: new Date().toISOString(),
    });
};

export const trackLinkClick = (linkName: string, linkUrl?: string) => {
    if (!analytics) return;
    logEvent(analytics!, "link_click", {
        link_name: linkName,
        link_url: linkUrl,
        timestamp: new Date().toISOString(),
    });
};

// Subscription Events
export const trackSubscriptionStart = (plan: "free" | "pro" | "premium") => {
    if (!analytics) return;
    logEvent(analytics!, "subscription_start", {
        plan: plan,
        timestamp: new Date().toISOString(),
    });
};

export const trackSubscriptionUpgrade = (fromPlan: string, toPlan: string) => {
    if (!analytics) return;
    logEvent(analytics!, "subscription_upgrade", {
        from_plan: fromPlan,
        to_plan: toPlan,
        timestamp: new Date().toISOString(),
    });
};

export const trackSubscriptionCancel = (plan: string) => {
    if (!analytics) return;
    logEvent(analytics!, "subscription_cancel", {
        plan: plan,
        timestamp: new Date().toISOString(),
    });
};

// Error Events
export const trackError = (errorCode: string, errorMessage: string) => {
    if (!analytics) return;
    logEvent(analytics!, "error", {
        error_code: errorCode,
        error_message: errorMessage,
        timestamp: new Date().toISOString(),
    });
};

// Landing Page Events
export const trackLandingPageView = () => {
    if (!analytics) return;
    logEvent(analytics!, "landing_page_view", {
        timestamp: new Date().toISOString(),
    });
};

export const trackAboutPageView = () => {
    if (!analytics) return;
    logEvent(analytics!, "about_page_view", {
        timestamp: new Date().toISOString(),
    });
};

export const trackCareersPageView = () => {
    if (!analytics) return;
    logEvent(analytics!, "careers_page_view", {
        timestamp: new Date().toISOString(),
    });
};

export const trackPricingPageView = () => {
    if (!analytics) return;
    logEvent(analytics!, "pricing_page_view", {
        timestamp: new Date().toISOString(),
    });
};

// Custom event for dashboard/app usage
export const trackAppSession = (sessionDuration?: number) => {
    if (!analytics) return;
    logEvent(analytics!, "app_session", {
        timestamp: new Date().toISOString(),
    });
};
