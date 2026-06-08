// デザインシステムのボタン定義: ピル型(主要導線・ホバーで色反転)と角型(操作系・ホバーで透過)の2系統をトークンで統一する

const buttonBaseClass =
    "inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none";

export const primaryButtonClass =
    `${buttonBaseClass} px-6 py-3 rounded-full border border-ink bg-ink text-surface hover:bg-surface hover:text-ink`;

export const secondaryButtonClass =
    `${buttonBaseClass} px-6 py-3 rounded-full border border-ink text-ink hover:bg-ink hover:text-surface`;

export const compactButtonClass =
    `${buttonBaseClass} px-4 py-2 text-sm border border-line text-muted hover:opacity-70`;
