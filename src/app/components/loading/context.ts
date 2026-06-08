import { createContext, useContext, type ReactElement } from "react";

interface LoadingOverlayContextValue {
    showLoadingOverlay: (screen: ReactElement) => void;
    scheduleHideLoadingOverlay: () => void;
}

export const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(null);

export function useLoadingOverlay() {
    const ctx = useContext(LoadingOverlayContext);
    if (!ctx) throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
    return ctx;
}
