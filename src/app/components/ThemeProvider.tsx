"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        
        const updateTheme = () => {
            let resolved: "light" | "dark";
            
            if (theme === "system") {
                resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            } else {
                resolved = theme;
            }
            
            setResolvedTheme(resolved);
            
            if (resolved === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        };

        updateTheme();
        localStorage.setItem("theme", theme);

        // システム設定の変更を監視
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, mounted]);

    // マウント前もProviderでラップする（初期値を使用）
    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
