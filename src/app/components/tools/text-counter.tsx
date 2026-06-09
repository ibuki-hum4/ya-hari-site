"use client";

import { useMemo, useState } from "react";

function countBytes(str: string): number {
    return new TextEncoder().encode(str).length;
}

function readingTimeMin(str: string, lang: "ja" | "en"): number {
    if (lang === "ja") return str.replace(/\s/g, "").length / 600;
    const words = str.trim().split(/\s+/).filter(Boolean).length;
    return words / 200;
}

function formatTime(min: number): string {
    if (min < 1) return `${Math.ceil(min * 60)}秒`;
    return `約${Math.ceil(min)}分`;
}

export default function TextCounter() {
    const [text, setText] = useState("");

    const stats = useMemo(() => {
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, "").length;
        const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        const lines = text === "" ? 0 : text.split("\n").length;
        const sentences = (text.match(/[。.!?！？]+/g) ?? []).length;
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
        const bytes = countBytes(text);
        const hiragana = (text.match(/[぀-ゟ]/g) ?? []).length;
        const katakana = (text.match(/[゠-ヿ]/g) ?? []).length;
        const kanji = (text.match(/[一-鿿㐀-䶿]/g) ?? []).length;
        const ascii = (text.match(/[A-Za-z0-9]/g) ?? []).length;
        const jaTime = formatTime(readingTimeMin(text, "ja"));
        const enTime = formatTime(readingTimeMin(text, "en"));
        return { chars, charsNoSpace, words, lines, sentences, paragraphs, bytes, hiragana, katakana, kanji, ascii, jaTime, enTime };
    }, [text]);

    const statItems = [
        { label: "文字数", value: stats.chars.toLocaleString() },
        { label: "スペースなし", value: stats.charsNoSpace.toLocaleString() },
        { label: "単語数", value: stats.words.toLocaleString() },
        { label: "行数", value: stats.lines.toLocaleString() },
        { label: "文", value: stats.sentences.toLocaleString() },
        { label: "段落", value: stats.paragraphs.toLocaleString() },
        { label: "バイト数 (UTF-8)", value: `${stats.bytes.toLocaleString()} B` },
        { label: "ひらがな", value: stats.hiragana.toLocaleString() },
        { label: "カタカナ", value: stats.katakana.toLocaleString() },
        { label: "漢字", value: stats.kanji.toLocaleString() },
        { label: "英数字", value: stats.ascii.toLocaleString() },
        { label: "読了時間 (日)", value: stats.jaTime },
        { label: "読了時間 (英)", value: stats.enTime },
    ];

    return (
        <div className="space-y-4">
            <textarea
                className="w-full h-56 font-mono text-sm p-4 bg-surface-alt border border-line rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-ink/20 placeholder:text-muted/50"
                placeholder="テキストを入力または貼り付けてください…"
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {statItems.map(({ label, value }) => (
                    <div key={label} className="bg-surface-alt border border-line rounded-xl p-3">
                        <p className="text-xs text-muted mb-1">{label}</p>
                        <p className="text-lg font-bold text-ink font-mono">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
