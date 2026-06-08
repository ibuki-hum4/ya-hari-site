import { ReactNode } from "react";

// ホバーで浮き上がるカードの共通スタイル。リンクとして使う場合はこのクラスをそのまま <a>/<Link> に渡す
export const cardClass =
    "bg-surface border border-line rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg";

interface CardProps {
    className?: string;
    children: ReactNode;
}

export default function Card({ className = "", children }: CardProps) {
    return <div className={`${cardClass} ${className}`}>{children}</div>;
}
