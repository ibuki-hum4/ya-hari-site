"use client";

import { useState, useCallback } from "react";
import { FiCopy, FiCheck, FiGitMerge } from "react-icons/fi";

type Mode = "format" | "diff";

function formatJson(raw: string, indent: number): { ok: true; result: string } | { ok: false; error: string } {
    try {
        const parsed = JSON.parse(raw);
        return { ok: true, result: JSON.stringify(parsed, null, indent) };
    } catch (e) {
        return { ok: false, error: (e as Error).message };
    }
}

type DiffNode = { type: "equal" | "added" | "removed" | "changed"; key: string; a?: unknown; b?: unknown; children?: DiffNode[] };

function diffObjects(a: unknown, b: unknown, key = ""): DiffNode[] {
    if (JSON.stringify(a) === JSON.stringify(b)) return [];
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) {
        return [{ type: "changed", key, a, b }];
    }
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
    const nodes: DiffNode[] = [];
    for (const k of allKeys) {
        if (!(k in aObj)) nodes.push({ type: "added", key: k, b: bObj[k] });
        else if (!(k in bObj)) nodes.push({ type: "removed", key: k, a: aObj[k] });
        else if (JSON.stringify(aObj[k]) !== JSON.stringify(bObj[k])) {
            const children = diffObjects(aObj[k], bObj[k], k);
            nodes.push(children.length ? { type: "changed", key: k, a: aObj[k], b: bObj[k], children } : { type: "changed", key: k, a: aObj[k], b: bObj[k] });
        }
    }
    return nodes;
}

function DiffLine({ node, depth = 0 }: { node: DiffNode; depth?: number }) {
    const pad = "  ".repeat(depth);
    const colors = { added: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40", removed: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40", changed: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40", equal: "" };
    const prefix = { added: "+ ", removed: "- ", changed: "~ ", equal: "  " };
    return (
        <div className={`font-mono text-xs leading-5 px-1 rounded ${colors[node.type]}`}>
            <span className="select-none opacity-50">{prefix[node.type]}</span>
            <span>{pad}{node.key}: </span>
            {node.type === "changed" && !node.children ? (
                <>
                    <span className="line-through opacity-60">{JSON.stringify(node.a)}</span>
                    <span className="ml-2">→ {JSON.stringify(node.b)}</span>
                </>
            ) : node.type === "added" ? (
                <span>{JSON.stringify(node.b)}</span>
            ) : node.type === "removed" ? (
                <span>{JSON.stringify(node.a)}</span>
            ) : null}
            {node.children?.map((child, i) => <DiffLine key={i} node={child} depth={depth + 1} />)}
        </div>
    );
}

export default function JsonFormatter() {
    const [mode, setMode] = useState<Mode>("format");
    const [input, setInput] = useState("");
    const [inputB, setInputB] = useState("");
    const [indent, setIndent] = useState(2);
    const [copied, setCopied] = useState(false);

    const formatted = input.trim() ? formatJson(input, indent) : null;
    const output = formatted?.ok ? formatted.result : null;
    const error = formatted && !formatted.ok ? formatted.error : null;

    const diffResult = useCallback(() => {
        if (!input.trim() || !inputB.trim()) return null;
        try {
            const a = JSON.parse(input);
            const b = JSON.parse(inputB);
            return diffObjects(a, b);
        } catch {
            return null;
        }
    }, [input, inputB]);

    const diffs = mode === "diff" ? diffResult() : null;

    const copy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const areaClass = "w-full h-64 font-mono text-xs p-3 bg-surface-alt border border-line rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-ink/20 placeholder:text-muted/50";

    return (
        <div className="space-y-4">
            {/* Mode */}
            <div className="flex gap-2">
                {(["format", "diff"] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                        className={`px-4 py-1.5 rounded-full text-sm transition-colors ${mode === m ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                        {m === "format" ? "Format" : <span className="flex items-center gap-1.5"><FiGitMerge size={13} /> Diff</span>}
                    </button>
                ))}
                {mode === "format" && (
                    <div className="flex items-center gap-2 ml-auto text-sm text-muted">
                        <span>Indent</span>
                        {[2, 4].map(n => (
                            <button key={n} onClick={() => setIndent(n)}
                                className={`px-2 py-0.5 rounded text-xs border transition-colors ${indent === n ? "bg-ink text-surface border-ink" : "border-line hover:border-ink"}`}>{n}</button>
                        ))}
                    </div>
                )}
            </div>

            {mode === "format" ? (
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted mb-1.5">Input JSON</p>
                        <textarea className={areaClass} placeholder='{"key": "value"}' value={input} onChange={e => setInput(e.target.value)} spellCheck={false} />
                        {error && <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>}
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs text-muted">Formatted</p>
                            {output && (
                                <button onClick={copy} className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors">
                                    {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            )}
                        </div>
                        <pre className={`${areaClass} overflow-auto whitespace-pre`}>{output ?? ""}</pre>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted mb-1.5">JSON A</p>
                            <textarea className={areaClass} placeholder='{"a": 1}' value={input} onChange={e => setInput(e.target.value)} spellCheck={false} />
                        </div>
                        <div>
                            <p className="text-xs text-muted mb-1.5">JSON B</p>
                            <textarea className={areaClass} placeholder='{"a": 2}' value={inputB} onChange={e => setInputB(e.target.value)} spellCheck={false} />
                        </div>
                    </div>
                    <div className="border border-line rounded-xl p-4 min-h-[120px]">
                        <p className="text-xs text-muted mb-3">Diff</p>
                        {diffs === null && <p className="text-sm text-muted">Enter valid JSON in both fields</p>}
                        {diffs?.length === 0 && <p className="text-sm text-emerald-500">✓ Identical</p>}
                        {diffs?.map((node, i) => <DiffLine key={i} node={node} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
