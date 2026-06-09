"use client";

import { useState } from "react";
import { FiArrowRight, FiCopy, FiCheck } from "react-icons/fi";

type Mode = "yaml2json" | "json2yaml";

function parseScalar(s: string): unknown {
    s = s.trim();
    if (!s || s === "null" || s === "~") return null;
    if (s === "true" || s === "yes") return true;
    if (s === "false" || s === "no") return false;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d*\.\d+([eE][+-]?\d+)?$/.test(s)) return parseFloat(s);
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
        return s.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (s.startsWith("{") || s.startsWith("[")) { try { return JSON.parse(s); } catch { /**/ } }
    return s;
}

function yamlToObj(yaml: string): unknown {
    const lines = yaml.split("\n");
    let i = 0;

    function skipEmpty() {
        while (i < lines.length && (lines[i].trim() === "" || lines[i].trim().startsWith("#"))) i++;
    }

    function indent(idx: number) {
        const line = lines[idx];
        if (!line || line.trim() === "") return Infinity;
        return line.search(/\S/);
    }

    function parseBlock(base: number): unknown {
        skipEmpty();
        if (i >= lines.length || indent(i) < base) return undefined;

        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith("- ")) {
            const arr: unknown[] = [];
            while (i < lines.length) {
                skipEmpty();
                if (i >= lines.length || indent(i) < base) break;
                const tl = lines[i].trim();
                if (!tl.startsWith("- ")) break;
                const after = tl.slice(2).trim();
                i++;
                if (after === "") {
                    arr.push(parseBlock(base + 2));
                } else if (/^\w[\w\s]*:/.test(after)) {
                    const saved = i;
                    const origLine = lines[i - 1];
                    lines[i - 1] = " ".repeat(base + 2) + after;
                    i--;
                    arr.push(parseBlock(base + 2));
                    lines[i - 1] = origLine;
                    void saved;
                } else {
                    arr.push(parseScalar(after));
                }
            }
            return arr;
        }

        if (/^\w[\w\s\-]*:/.test(trimmed) || trimmed.startsWith('"')) {
            const obj: Record<string, unknown> = {};
            while (i < lines.length) {
                skipEmpty();
                if (i >= lines.length || indent(i) < base) break;
                const tl = lines[i].trim();
                if (tl.startsWith("#")) { i++; continue; }
                const colonIdx = tl.indexOf(":");
                if (colonIdx === -1) break;
                const key = tl.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
                const after = tl.slice(colonIdx + 1).trim();
                i++;
                if (after === "" || after === "|" || after === ">") {
                    obj[key] = parseBlock(base + 2);
                } else {
                    obj[key] = parseScalar(after);
                }
            }
            return obj;
        }

        i++;
        return parseScalar(trimmed);
    }

    return parseBlock(0);
}

function objToYaml(val: unknown, depth = 0): string {
    const pad = "  ".repeat(depth);
    if (val === null || val === undefined) return "null";
    if (typeof val === "boolean") return String(val);
    if (typeof val === "number") return String(val);
    if (typeof val === "string") {
        if (/[:\n#\[\]{}'"@`|>&*!,?%]/.test(val) || val !== val.trim() || val === "")
            return JSON.stringify(val);
        return val;
    }
    if (Array.isArray(val)) {
        if (val.length === 0) return "[]";
        return val.map(item => {
            if (typeof item === "object" && item !== null) {
                const inner = objToYaml(item, depth + 1).trimStart();
                return `${pad}- ${inner}`;
            }
            return `${pad}- ${objToYaml(item, depth + 1)}`;
        }).join("\n");
    }
    if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        const keys = Object.keys(obj);
        if (keys.length === 0) return "{}";
        return keys.map(key => {
            const v = obj[key];
            if (typeof v === "object" && v !== null) {
                return `${pad}${key}:\n${objToYaml(v, depth + 1)}`;
            }
            return `${pad}${key}: ${objToYaml(v, depth + 1)}`;
        }).join("\n");
    }
    return String(val);
}

export default function YamlJson() {
    const [mode, setMode] = useState<Mode>("yaml2json");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const convert = () => {
        setError("");
        setOutput("");
        try {
            if (mode === "yaml2json") {
                const obj = yamlToObj(input);
                setOutput(JSON.stringify(obj, null, 2));
            } else {
                const obj = JSON.parse(input);
                setOutput(objToYaml(obj));
            }
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const copy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const areaClass = "w-full h-64 font-mono text-xs p-3 bg-surface-alt border border-line rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-ink/20";

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
                {([["yaml2json", "YAML → JSON"], ["json2yaml", "JSON → YAML"]] as const).map(([m, label]) => (
                    <button key={m} onClick={() => { setMode(m); setOutput(""); setError(""); }}
                        className={`px-4 py-1.5 rounded-full text-sm transition-colors ${mode === m ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted mb-1.5">{mode === "yaml2json" ? "YAML" : "JSON"}</p>
                    <textarea className={areaClass} value={input} onChange={e => setInput(e.target.value)}
                        placeholder={mode === "yaml2json" ? "name: Yahari\nage: 14\nhobbies:\n  - coding\n  - music" : '{"name":"Yahari","age":14}'}
                        spellCheck={false} />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted">{mode === "yaml2json" ? "JSON" : "YAML"}</p>
                        {output && (
                            <button onClick={copy} className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors">
                                {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        )}
                    </div>
                    <pre className={`${areaClass} overflow-auto whitespace-pre`}>{output}</pre>
                    {error && <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>}
                </div>
            </div>

            <button onClick={convert}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-surface text-sm hover:opacity-80 transition-opacity">
                変換する <FiArrowRight size={14} />
            </button>
        </div>
    );
}
