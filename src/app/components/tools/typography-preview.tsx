"use client";

import { useState } from "react";

const FONTS = [
    "sans-serif", "serif", "monospace",
    "Georgia", "Times New Roman", "Arial", "Helvetica", "Verdana", "Trebuchet MS",
    "Courier New", "Impact", "Comic Sans MS",
];

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const DEFAULT_TEXT = "The quick brown fox jumps over the lazy dog.\nあのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら";

export default function TypographyPreview() {
    const [text, setText] = useState(DEFAULT_TEXT);
    const [font, setFont] = useState("sans-serif");
    const [size, setSize] = useState(24);
    const [weight, setWeight] = useState(400);
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [lineHeight, setLineHeight] = useState(1.5);
    const [color, setColor] = useState("#1a1a1a");
    const [bgColor, setBgColor] = useState("#ffffff");

    const sliderClass = "w-full accent-ink";
    const labelClass = "text-xs text-muted mb-1 block";

    return (
        <div className="space-y-5">
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-surface-alt border border-line rounded-2xl">
                <div>
                    <label className={labelClass}>Font Family</label>
                    <select value={font} onChange={e => setFont(e.target.value)}
                        className="w-full text-sm bg-surface border border-line rounded-xl px-3 py-2 focus:outline-none">
                        {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Weight</label>
                    <select value={weight} onChange={e => setWeight(Number(e.target.value))}
                        className="w-full text-sm bg-surface border border-line rounded-xl px-3 py-2 focus:outline-none">
                        {WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Size: {size}px</label>
                    <input type="range" min={10} max={120} value={size} onChange={e => setSize(Number(e.target.value))} className={sliderClass} />
                </div>
                <div>
                    <label className={labelClass}>Letter Spacing: {letterSpacing}px</label>
                    <input type="range" min={-2} max={20} step={0.5} value={letterSpacing} onChange={e => setLetterSpacing(Number(e.target.value))} className={sliderClass} />
                </div>
                <div>
                    <label className={labelClass}>Line Height: {lineHeight}</label>
                    <input type="range" min={1} max={3} step={0.1} value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))} className={sliderClass} />
                </div>
                <div className="flex gap-4">
                    <div>
                        <label className={labelClass}>Text</label>
                        <input type="color" value={color} onChange={e => setColor(e.target.value)}
                            className="w-10 h-9 rounded-lg border border-line cursor-pointer bg-transparent" />
                    </div>
                    <div>
                        <label className={labelClass}>Background</label>
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                            className="w-10 h-9 rounded-lg border border-line cursor-pointer bg-transparent" />
                    </div>
                </div>
            </div>

            {/* Text input */}
            <textarea value={text} onChange={e => setText(e.target.value)}
                className="w-full h-20 text-sm p-3 bg-surface-alt border border-line rounded-xl resize-none focus:outline-none placeholder:text-muted/50"
                placeholder="Preview text…" />

            {/* Preview */}
            <div className="border border-line rounded-2xl p-6 min-h-[120px] overflow-auto"
                style={{ backgroundColor: bgColor }}>
                <p style={{ fontFamily: font, fontSize: `${size}px`, fontWeight: weight, letterSpacing: `${letterSpacing}px`, lineHeight, color, whiteSpace: "pre-wrap" }}>
                    {text || "…"}
                </p>
            </div>

            {/* CSS snippet */}
            <div className="bg-surface-alt border border-line rounded-xl p-4">
                <p className="text-xs text-muted mb-2">CSS</p>
                <pre className="text-xs font-mono text-ink overflow-x-auto">{`font-family: ${font};\nfont-size: ${size}px;\nfont-weight: ${weight};\nletter-spacing: ${letterSpacing}px;\nline-height: ${lineHeight};\ncolor: ${color};`}</pre>
            </div>
        </div>
    );
}
