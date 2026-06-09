"use client";

import { useState, useEffect } from "react";
import { FiCopy, FiCheck, FiEye, FiCode } from "react-icons/fi";
import { marked } from "marked";

const SAMPLE = `# Hello, Markdown!

これは **Markdown** のサンプルです。

## リスト

- アイテム1
- アイテム2
  - ネストされたアイテム

## コードブロック

\`\`\`js
const greet = name => \`Hello, \${name}!\`;
\`\`\`

## リンク

[やーはり](https://ya-hari.skyia.jp) — ポートフォリオサイト

> 引用文はこのように表示されます。

---

| 列A | 列B |
|-----|-----|
| 値1 | 値2 |
`;

export default function MarkdownHtml() {
    const [md, setMd] = useState(SAMPLE);
    const [html, setHtml] = useState("");
    const [view, setView] = useState<"preview" | "source">("preview");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setHtml(marked(md) as string);
    }, [md]);

    const copy = () => {
        navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 items-start">
                {/* Editor */}
                <div>
                    <p className="text-xs text-muted mb-1.5">Markdown</p>
                    <textarea
                        className="w-full h-[480px] font-mono text-xs p-4 bg-surface-alt border border-line rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-ink/20"
                        value={md} onChange={e => setMd(e.target.value)} spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex gap-1">
                            <button onClick={() => setView("preview")}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-colors ${view === "preview" ? "bg-ink text-surface" : "text-muted hover:text-ink"}`}>
                                <FiEye size={11} /> Preview
                            </button>
                            <button onClick={() => setView("source")}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-colors ${view === "source" ? "bg-ink text-surface" : "text-muted hover:text-ink"}`}>
                                <FiCode size={11} /> HTML
                            </button>
                        </div>
                        <button onClick={copy} className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors">
                            {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                            {copied ? "Copied" : "Copy HTML"}
                        </button>
                    </div>
                    {view === "preview" ? (
                        <div
                            className="h-[480px] overflow-auto border border-line rounded-xl p-4 prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    ) : (
                        <pre className="h-[480px] overflow-auto font-mono text-xs p-4 bg-surface-alt border border-line rounded-xl whitespace-pre-wrap break-all">
                            {html}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
