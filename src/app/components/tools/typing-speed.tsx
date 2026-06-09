"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Lang = "en" | "ja";

const PASSAGES: Record<Lang, string[]> = {
    en: [
        "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump. The five boxing wizards jump quickly.",
        "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
        "All that glitters is not gold. Often have you heard that told. Many a man his life hath sold but my outside to behold. Gilded tombs do worms enfold.",
        "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
    ],
    ja: [
        "吾輩は猫である。名前はまだない。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。",
        "春は曙。やうやう白くなりゆく山ぎは、少し明かりて、紫だちたる雲の細くたなびきたる。夏は夜。月のころはさらなり、やみもなほ、蛍の多く飛びちがひたる。",
        "親譲りの無鉄砲で小供の時から損ばかりしている。小学校にいる時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。",
        "国境の長いトンネルを抜けると雪国であった。夜の底が白くなった。信号所に汽車が止まった。向側の座席から娘が立って来て、島村の前のガラス窓を落した。",
    ],
};

const DURATION = 60;

export default function TypingSpeed() {
    const [lang, setLang] = useState<Lang>("en");
    const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
    const [passage, setPassage] = useState("");
    const [typed, setTyped] = useState("");
    const [timeLeft, setTimeLeft] = useState(DURATION);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    const newPassage = useCallback((l: Lang) => {
        const list = PASSAGES[l];
        return list[Math.floor(Math.random() * list.length)];
    }, []);

    const start = useCallback(() => {
        const p = newPassage(lang);
        setPassage(p);
        setTyped("");
        setTimeLeft(DURATION);
        setWpm(0);
        setAccuracy(100);
        setStatus("running");
        startTimeRef.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [lang, newPassage]);

    useEffect(() => {
        if (status !== "running") return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    setStatus("done");
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status]);

    const handleType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setTyped(val);

        const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
        if (elapsed > 0) {
            if (lang === "en") {
                const words = val.trim().split(/\s+/).filter(Boolean).length;
                setWpm(Math.round(words / elapsed));
            } else {
                setWpm(Math.round(val.length / elapsed));
            }
        }

        let correct = 0;
        const minLen = Math.min(val.length, passage.length);
        for (let i = 0; i < minLen; i++) if (val[i] === passage[i]) correct++;
        setAccuracy(val.length ? Math.round((correct / val.length) * 100) : 100);

        if (val === passage) {
            clearInterval(timerRef.current!);
            setStatus("done");
        }
    };

    const chars = passage.split("");

    return (
        <div className="space-y-5 max-w-2xl">
            {/* Header controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                    {(["en", "ja"] as const).map(l => (
                        <button key={l} onClick={() => { setLang(l); setStatus("idle"); }}
                            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${lang === l ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                            {l === "en" ? "English" : "日本語"}
                        </button>
                    ))}
                </div>
                <button onClick={start} className="px-5 py-1.5 rounded-xl bg-ink text-surface text-sm hover:opacity-80 transition-opacity">
                    {status === "idle" ? "スタート" : "リセット"}
                </button>
                {status !== "idle" && (
                    <div className="flex gap-4 ml-auto text-sm font-mono">
                        <span className={`font-bold ${timeLeft <= 10 ? "text-red-500" : "text-ink"}`}>{timeLeft}s</span>
                        <span className="text-muted">{lang === "en" ? `${wpm} WPM` : `${wpm} CPM`}</span>
                        <span className="text-muted">{accuracy}%</span>
                    </div>
                )}
            </div>

            {status === "idle" && (
                <div className="border border-line rounded-2xl p-6 text-center text-muted">
                    <p>「スタート」を押して60秒間タイピングを開始してください</p>
                </div>
            )}

            {(status === "running" || status === "done") && (
                <>
                    {/* Passage display */}
                    <div className="font-mono text-sm leading-7 p-4 bg-surface-alt border border-line rounded-xl select-none">
                        {chars.map((ch, i) => {
                            const isTyped = i < typed.length;
                            const isCorrect = typed[i] === ch;
                            const isCursor = i === typed.length;
                            return (
                                <span key={i}
                                    className={`${isCursor ? "bg-ink text-surface rounded" : isTyped ? isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 bg-red-50 dark:bg-red-950/40 rounded" : "text-muted"}`}>
                                    {ch}
                                </span>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <textarea ref={inputRef} value={typed} onChange={handleType}
                        disabled={status === "done"}
                        className="w-full h-28 font-mono text-sm p-4 bg-surface border border-line rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:opacity-60"
                        placeholder="ここに入力してください…" spellCheck={false} />

                    {status === "done" && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-surface-alt border border-line rounded-2xl text-center">
                            <div>
                                <p className="text-2xl font-bold text-ink font-mono">{wpm}</p>
                                <p className="text-xs text-muted">{lang === "en" ? "WPM" : "CPM"}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-ink font-mono">{accuracy}%</p>
                                <p className="text-xs text-muted">Accuracy</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-ink font-mono">{typed.length}</p>
                                <p className="text-xs text-muted">Characters</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
