"use client";

import { Toaster } from "sonner";
import { useTheme } from "./ThemeProvider";

// デザイントークン(bg-surface/text-ink等)に合わせたトースト通知
export default function AppToaster() {
    const { resolvedTheme } = useTheme();

    return (
        <Toaster
            theme={resolvedTheme}
            position="bottom-right"
            toastOptions={{
                classNames: {
                    toast: "!bg-surface !text-ink !border !border-line !rounded-2xl !shadow-lg",
                    description: "!text-muted",
                    actionButton: "!bg-ink !text-surface",
                    cancelButton: "!bg-surface-alt !text-ink",
                },
            }}
        />
    );
}
