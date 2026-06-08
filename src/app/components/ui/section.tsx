import { ReactNode } from "react";

// vh単位の縦リズムトークンを適用するセクションラッパー
interface SectionProps {
    id?: string;
    className?: string;
    containerClassName?: string;
    children: ReactNode;
}

export default function Section({ id, className = "", containerClassName = "max-w-6xl mx-auto", children }: SectionProps) {
    return (
        <section id={id} className={`px-4 sm:px-8 ${className}`} style={{ paddingBlock: "var(--space-lg)" }}>
            <div className={containerClassName}>{children}</div>
        </section>
    );
}
