export const COOKIE_CONSENT_KEY = "cookie-consent";

export type ConsentStatus = "pending" | "accepted" | "rejected";

export function getCookieConsent(): ConsentStatus {
    if (typeof window === "undefined") return "pending";
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    return saved === "accepted" || saved === "rejected" ? saved : "pending";
}

export function setCookieConsent(status: "accepted" | "rejected") {
    localStorage.setItem(COOKIE_CONSENT_KEY, status);
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("consent", "update", {
            analytics_storage: status === "accepted" ? "granted" : "denied",
        });
    }
}

declare global {
    interface Window {
        gtag: (
            command: string,
            action: string,
            params?: Record<string, string>
        ) => void;
    }
}
