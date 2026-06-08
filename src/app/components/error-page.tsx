"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import Header from "./header";
import Footer from "./footer";
import { primaryButtonClass, secondaryButtonClass } from "./ui/button";

export const primaryActionClass = primaryButtonClass;

export const secondaryActionClass = secondaryButtonClass;

interface ErrorPageProps {
    code: number;
    icon: ReactNode;
    title: string;
    description: string;
    note?: string;
    actions: ReactNode;
}

export default function ErrorPage({ code, icon, title, description, note, actions }: ErrorPageProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                >
                    <div className="relative mb-8">
                        <h1 className="text-[150px] md:text-[200px] font-bold text-ink/5 select-none">
                            {code}
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl">{icon}</div>
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-ink mb-4">
                        {title}
                    </h2>
                    <p className={`text-muted max-w-md mx-auto ${note ? "mb-4" : "mb-8"}`}>
                        {description}
                    </p>
                    {note && (
                        <p className="text-sm text-muted mb-8 max-w-md mx-auto font-mono">
                            {note}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">{actions}</div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
