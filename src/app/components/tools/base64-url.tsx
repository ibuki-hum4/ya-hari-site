"use client";

import { useState, useRef } from "react";
import { FiCopy, FiCheck, FiUpload } from "react-icons/fi";

type Tab = "base64" | "url";
type Dir = "encode" | "decode";

function copyToClipboard(text: string, setDone: (v: boolean) => void) {
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
}

export default function Base64Url() {
    const [tab, setTab] = useState<Tab>("base64");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const convert = (dir: Dir, val = input) => {
        setError("");
        try {
            if (tab === "base64") {
                if (dir === "encode") {
                    setOutput(btoa(unescape(encodeURIComponent(val))));
                } else {
                    setOutput(decodeURIComponent(escape(atob(val.trim()))));
                }
            } else {
                if (dir === "encode") setOutput(encodeURIComponent(val));
                else setOutput(decodeURIComponent(val));
            }
        } catch {
            setError("変換に失敗しました。入力を確認してください。");
            setOutput("");
        }
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            setInput(`data:${file.type};base64,${base64}`);
            setOutput(`data:${file.type};base64,${base64}`);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const areaClass = "w-full h-40 font-mono text-xs p-3 bg-surface-alt border border-line rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-ink/20 placeholder:text-muted/50";

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
                {(["base64", "url"] as const).map(t => (
                    <button key={t} onClick={() => { setTab(t); setOutput(""); setError(""); }}
                        className={`px-4 py-1.5 rounded-full text-sm transition-colors ${tab === t ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                        {t === "base64" ? "Base64" : "URL Encode"}
                    </button>
                ))}
                {tab === "base64" && (
                    <>
                        <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
                        <button onClick={() => fileRef.current?.click()}
                            className="ml-auto flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors border border-line px-3 py-1.5 rounded-xl">
                            <FiUpload size={13} /> File → Base64
                        </button>
                    </>
                )}
            </div>

            {/* Input */}
            <div>
                <p className="text-xs text-muted mb-1.5">Input</p>
                <textarea className={areaClass} value={input} onChange={e => setInput(e.target.value)}
                    placeholder={tab === "base64" ? "テキストを入力…" : "https://example.com/path?q=hello world"} spellCheck={false} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap">
                {(["encode", "decode"] as const).map(dir => (
                    <button key={dir} onClick={() => convert(dir)}
                        className="px-5 py-2 rounded-xl bg-ink text-surface text-sm hover:opacity-80 transition-opacity">
                        {dir === "encode" ? "Encode →" : "← Decode"}
                    </button>
                ))}
            </div>

            {/* Output */}
            {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-muted">Output</p>
                    {output && (
                        <button onClick={() => copyToClipboard(output, setCopied)}
                            className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors">
                            {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    )}
                </div>
                <pre className={`${areaClass} overflow-auto whitespace-pre-wrap break-all`}>{output}</pre>
            </div>
        </div>
    );
}
