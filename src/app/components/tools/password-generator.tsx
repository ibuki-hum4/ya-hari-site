"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiCheck, FiCopy, FiRefreshCw } from "react-icons/fi";
import { primaryButtonClass } from "../ui/button";

const CHARSETS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}",
} as const;

type CharsetKey = keyof typeof CHARSETS;
const CHARSET_KEYS = Object.keys(CHARSETS) as CharsetKey[];

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;

const MIN_COUNT = 1;
const MAX_COUNT = 10;
const DEFAULT_COUNT = 1;

// 「すべてコピー」がコピー済みであることを表す特別なインデックス(個別の行とは衝突しない値)
const COPY_ALL_INDEX = -1;

const STRENGTH_BAR_CLASS: Record<"weak" | "medium" | "strong", string> = {
    weak: "bg-red-500 w-1/3",
    medium: "bg-amber-500 w-2/3",
    strong: "bg-emerald-500 w-full",
};

// Web Crypto APIの安全な乱数で生成するため、サーバーには一切送信されずブラウザ内で完結する
function generatePassword(length: number, enabled: Record<CharsetKey, boolean>): string {
    const pool = CHARSET_KEYS.filter((key) => enabled[key])
        .map((key) => CHARSETS[key])
        .join("");
    if (!pool) return "";

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let result = "";
    for (let i = 0; i < length; i++) {
        result += pool[randomValues[i] % pool.length];
    }
    return result;
}

function generatePasswords(length: number, count: number, enabled: Record<CharsetKey, boolean>): string[] {
    return Array.from({ length: count }, () => generatePassword(length, enabled));
}

function getStrength(length: number, charsetCount: number): "weak" | "medium" | "strong" {
    if (length >= 16 && charsetCount >= 3) return "strong";
    if (length >= 10 && charsetCount >= 2) return "medium";
    return "weak";
}

export default function PasswordGenerator() {
    const t = useTranslations("tools.passwordGenerator");
    const [length, setLength] = useState(DEFAULT_LENGTH);
    const [count, setCount] = useState(DEFAULT_COUNT);
    const [enabled, setEnabled] = useState<Record<CharsetKey, boolean>>({
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: false,
    });
    const [passwords, setPasswords] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const regenerate = () => setPasswords(generatePasswords(length, count, enabled));

    // 長さ・件数・文字種の組み合わせが変わるたびに自動で再生成する(初回マウント時にも実行される)
    useEffect(() => {
        setPasswords(generatePasswords(length, count, enabled));
    }, [length, count, enabled]);

    useEffect(() => {
        if (copiedIndex === null) return;
        const timeout = setTimeout(() => setCopiedIndex(null), 1800);
        return () => clearTimeout(timeout);
    }, [copiedIndex]);

    const copyText = async (text: string, index: number) => {
        if (!text || typeof navigator === "undefined" || !navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
        } catch {
            // クリップボードAPIが使えない環境(非HTTPS等)では何もしない
        }
    };

    const toggleCharset = (key: CharsetKey) => {
        setEnabled((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            // すべての文字種をオフにはできないようにする(空のプールで生成できなくなるのを防ぐ)
            if (!Object.values(next).some(Boolean)) return prev;
            return next;
        });
    };

    const charsetCount = Object.values(enabled).filter(Boolean).length;
    const strength = getStrength(length, charsetCount);

    return (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8 lg:gap-14 items-start">
            {/* 設定 */}
            <div className="space-y-8">
                {/* 長さ */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label htmlFor="password-length" className="text-sm text-muted">
                            {t("length")}
                        </label>
                        <span className="text-sm font-mono text-ink">{length}</span>
                    </div>
                    <input
                        id="password-length"
                        type="range"
                        min={MIN_LENGTH}
                        max={MAX_LENGTH}
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full accent-ink"
                    />
                </div>

                {/* 生成数 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label htmlFor="password-count" className="text-sm text-muted">
                            {t("count")}
                        </label>
                        <span className="text-sm font-mono text-ink">{count}</span>
                    </div>
                    <input
                        id="password-count"
                        type="range"
                        min={MIN_COUNT}
                        max={MAX_COUNT}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full accent-ink"
                    />
                </div>

                {/* 文字種 */}
                <div>
                    <p className="text-sm text-muted mb-3">{t("characterTypes")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CHARSET_KEYS.map((key) => (
                            <label
                                key={key}
                                className="inline-flex items-center gap-3 px-4 py-3 border border-line rounded-xl text-sm text-ink cursor-pointer hover:border-ink transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={enabled[key]}
                                    onChange={() => toggleCharset(key)}
                                    className="accent-ink"
                                />
                                {t(`charsets.${key}`)}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="button" onClick={regenerate} className={`${primaryButtonClass} w-full sm:w-auto`}>
                    <FiRefreshCw size={16} />
                    {t("generate")}
                </button>
            </div>

            {/* 生成結果一覧 */}
            <div className="border border-line rounded-2xl p-5 sm:p-6 bg-surface lg:sticky lg:top-28">
                <div className="space-y-2.5">
                    {passwords.map((password, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <code className="flex-1 font-mono text-sm sm:text-lg text-ink break-all select-all">
                                {password || "—"}
                            </code>
                            <button
                                type="button"
                                onClick={() => copyText(password, index)}
                                aria-label={copiedIndex === index ? t("copied") : t("copy")}
                                title={copiedIndex === index ? t("copied") : t("copy")}
                                className="shrink-0 p-2 border border-line rounded-full text-muted hover:text-ink hover:border-ink transition-colors"
                            >
                                {copiedIndex === index ? (
                                    <FiCheck size={16} className="text-emerald-500" />
                                ) : (
                                    <FiCopy size={16} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <button
                        type="button"
                        onClick={regenerate}
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
                    >
                        <FiRefreshCw size={14} />
                        {t("regenerate")}
                    </button>
                    {passwords.length > 1 && (
                        <button
                            type="button"
                            onClick={() => copyText(passwords.join("\n"), COPY_ALL_INDEX)}
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
                        >
                            {copiedIndex === COPY_ALL_INDEX ? (
                                <FiCheck size={14} className="text-emerald-500" />
                            ) : (
                                <FiCopy size={14} />
                            )}
                            {t("copyAll")}
                        </button>
                    )}
                </div>

                {/* 強度インジケーター(長さ・文字種が同じ条件で生成しているため、全件共通の値を表示する) */}
                <div className="mt-5">
                    <div className="h-1.5 rounded-full bg-line overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${STRENGTH_BAR_CLASS[strength]}`} />
                    </div>
                    <p className="text-xs text-muted mt-2">{t(`strength.${strength}`)}</p>
                </div>
            </div>
        </div>
    );
}
