import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// 下線のみのミニマルなフォームスタイル。枠線フォームから置き換える際の共通基盤
const fieldClass =
    "w-full bg-transparent border-0 border-b-2 border-line px-0 py-2 text-ink placeholder:text-muted focus:border-ink focus:outline-none transition-colors";

export function FieldLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <label className={`flex items-center gap-2 text-sm text-muted mb-2 ${className}`}>
            {children}
        </label>
    );
}

// バリデーションエラーメッセージ。空のときは何も描画しない
export function FieldError({ children }: { children?: ReactNode }) {
    if (!children) return null;
    return <p className="text-xs text-red-500 mt-1.5">{children}</p>;
}

export function TextField({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`${fieldClass} ${className}`} />;
}

export function TextAreaField({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...props} className={`${fieldClass} resize-none ${className}`} />;
}

export function SelectField({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={`${fieldClass} ${className}`} />;
}
