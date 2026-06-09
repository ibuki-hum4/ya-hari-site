"use client";

import { useState, useMemo, useCallback } from "react";
import { FiCopy, FiCheck, FiRotateCcw } from "react-icons/fi";

type CommitType = { value: string; label: string; desc: string; emoji: string };

const TYPES: CommitType[] = [
    { value: "feat",     label: "feat",     desc: "新機能",           emoji: "✨"  },
    { value: "fix",      label: "fix",      desc: "バグ修正",         emoji: "🐛"  },
    { value: "docs",     label: "docs",     desc: "ドキュメント",     emoji: "📝"  },
    { value: "style",    label: "style",    desc: "スタイル",         emoji: "🎨"  },
    { value: "refactor", label: "refactor", desc: "リファクタリング", emoji: "♻️"  },
    { value: "test",     label: "test",     desc: "テスト",           emoji: "✅"  },
    { value: "chore",    label: "chore",    desc: "雑務",             emoji: "🔧"  },
    { value: "perf",     label: "perf",     desc: "パフォーマンス",   emoji: "⚡️" },
    { value: "ci",       label: "ci",       desc: "CI/CD",            emoji: "👷"  },
    { value: "revert",   label: "revert",   desc: "取り消し",         emoji: "⏪️" },
];

const DESC_LIMIT = 72;
const INPUT = "w-full border border-line rounded-xl px-4 py-3 bg-surface text-ink placeholder:text-muted focus:outline-none focus:border-ink text-sm transition-colors";

export default function CommitMessage() {
    const [type, setType]             = useState("feat");
    const [scope, setScope]           = useState("");
    const [description, setDesc]      = useState("");
    const [body, setBody]             = useState("");
    const [footer, setFooter]         = useState("");
    const [isBreaking, setIsBreaking] = useState(false);
    const [useGitmoji, setGitmoji]    = useState(false);
    const [copied, setCopied]         = useState(false);

    const selectedType = TYPES.find(t => t.value === type)!;

    const commit = useMemo(() => {
        if (!description.trim()) return "";
        const found    = TYPES.find(t => t.value === type);
        const emoji    = useGitmoji && found ? `${found.emoji} ` : "";
        const scopePart = scope.trim() ? `(${scope.trim()})` : "";
        const bang     = isBreaking ? "!" : "";
        let msg = `${emoji}${type}${scopePart}${bang}: ${description.trim()}`;
        if (body.trim())   msg += `\n\n${body.trim()}`;
        if (footer.trim()) msg += `\n\n${footer.trim()}`;
        return msg;
    }, [type, scope, description, body, footer, isBreaking, useGitmoji]);

    const handleCopy = useCallback(() => {
        if (!commit) return;
        navigator.clipboard.writeText(commit);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [commit]);

    const handleReset = useCallback(() => {
        setType("feat"); setScope(""); setDesc(""); setBody(""); setFooter("");
        setIsBreaking(false); setGitmoji(false);
    }, []);

    const descLen = description.length;
    const descColor =
        descLen > DESC_LIMIT         ? "text-red-500"
        : descLen > DESC_LIMIT * 0.85 ? "text-amber-500"
        : "text-muted";

    return (
        <div className="space-y-6 max-w-3xl">

            {/* ── type ── */}
            <div>
                <p className="text-sm font-semibold text-ink mb-3">
                    type <span className="text-red-400 font-normal">*</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {TYPES.map(t => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                                type === t.value
                                    ? "bg-ink text-surface border-ink"
                                    : "border-line text-muted hover:text-ink"
                            }`}
                        >
                            <span className="font-mono text-sm font-semibold flex items-center gap-1.5">
                                {useGitmoji && <span className="text-base leading-none">{t.emoji}</span>}
                                {t.label}
                            </span>
                            <span className={`block text-xs mt-0.5 ${type === t.value ? "opacity-60" : "opacity-50"}`}>
                                {t.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── scope + description ── */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-4">
                <div>
                    <p className="text-sm font-semibold text-ink mb-2">
                        scope <span className="font-normal text-xs text-muted">任意</span>
                    </p>
                    <input
                        type="text"
                        value={scope}
                        onChange={e => setScope(e.target.value)}
                        placeholder="auth / api / ui"
                        className={`${INPUT} font-mono`}
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-ink">
                            description <span className="text-red-400 font-normal">*</span>
                        </p>
                        <span className={`text-xs tabular-nums ${descColor}`}>
                            {descLen} / {DESC_LIMIT}
                        </span>
                    </div>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDesc(e.target.value)}
                        placeholder="変更内容を一行で"
                        className={INPUT}
                    />
                </div>
            </div>

            {/* ── body ── */}
            <div>
                <p className="text-sm font-semibold text-ink mb-2">
                    body <span className="font-normal text-xs text-muted">任意</span>
                </p>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder={"変更の詳細な説明（複数行可）"}
                    rows={3}
                    className={`${INPUT} resize-y`}
                />
            </div>

            {/* ── footer ── */}
            <div>
                <p className="text-sm font-semibold text-ink mb-2">
                    footer <span className="font-normal text-xs text-muted">任意</span>
                </p>
                <textarea
                    value={footer}
                    onChange={e => setFooter(e.target.value)}
                    placeholder={
                        isBreaking
                            ? "BREAKING CHANGE: 変更の詳細"
                            : "BREAKING CHANGE: 詳細 / Closes #123"
                    }
                    rows={2}
                    className={`${INPUT} resize-y font-mono`}
                />
            </div>

            {/* ── options ── */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIsBreaking(v => !v)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                        isBreaking
                            ? "border-red-400 text-red-500 dark:text-red-400"
                            : "border-line text-muted hover:text-ink"
                    }`}
                >
                    ⚠️ BREAKING CHANGE
                    {isBreaking && <span className="font-mono text-xs opacity-70">(!)</span>}
                </button>

                <button
                    type="button"
                    onClick={() => setGitmoji(v => !v)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                        useGitmoji
                            ? "bg-ink text-surface border-ink"
                            : "border-line text-muted hover:text-ink"
                    }`}
                >
                    {selectedType.emoji} gitmoji {useGitmoji ? "ON" : "OFF"}
                </button>
            </div>

            {/* ── preview ── */}
            <div className="border border-line rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
                    <span className="text-[10px] font-mono text-muted tracking-[0.15em] uppercase select-none">
                        Preview
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-line text-muted hover:text-ink transition-colors"
                        >
                            <FiRotateCcw size={11} />
                            リセット
                        </button>
                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!commit}
                            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                !commit
                                    ? "opacity-30 cursor-not-allowed border-line text-muted"
                                    : copied
                                        ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                        : "border-line text-muted hover:text-ink hover:border-ink"
                            }`}
                        >
                            {copied ? <FiCheck size={11} /> : <FiCopy size={11} />}
                            {copied ? "コピー済み" : "コピー"}
                        </button>
                    </div>
                </div>
                <pre className="p-5 font-mono text-sm text-ink leading-relaxed whitespace-pre-wrap min-h-[88px] select-all">
                    {commit || (
                        <span className="text-muted text-xs font-sans not-italic">
                            type と description を入力するとプレビューが表示されます
                        </span>
                    )}
                </pre>
            </div>
        </div>
    );
}
