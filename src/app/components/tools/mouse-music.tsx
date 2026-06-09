"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { FiPlay, FiSquare } from "react-icons/fi";

type ScaleKey = "pentatonic" | "major" | "minor" | "chromatic";

const SCALES: Record<ScaleKey, number[]> = {
    pentatonic: [0, 2, 4, 7, 9],
    major:      [0, 2, 4, 5, 7, 9, 11],
    minor:      [0, 2, 3, 5, 7, 8, 10],
    chromatic:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const SCALE_LABELS: Record<ScaleKey, string> = {
    pentatonic: "ペンタトニック",
    major: "メジャー",
    minor: "マイナー",
    chromatic: "クロマチック",
};

function freqForNote(semitone: number): number {
    return 440 * Math.pow(2, (semitone - 69) / 12);
}

export default function MouseMusic() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxAudioRef = useRef<AudioContext | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const animRef = useRef<number>(0);
    const [playing, setPlaying] = useState(false);
    const [scale, setScale] = useState<ScaleKey>("pentatonic");
    const [waveform, setWaveform] = useState<OscillatorType>("sine");
    const posRef = useRef({ x: 0.5, y: 0.5 });
    const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);

    const noteFromPos = useCallback((x: number, y: number) => {
        const notes = SCALES[scale];
        const idx = Math.floor(x * notes.length);
        const clamped = Math.min(idx, notes.length - 1);
        // Y: 上=オクターブ5(高音), 下=オクターブ3(低音) → MIDI 48〜83 (C3〜B5)
        const octave = 3 + Math.floor((1 - y) * 2);
        return 12 * (octave + 1) + notes[clamped];
    }, [scale]);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = "rgba(128,128,128,0.1)";
        ctx.lineWidth = 1;
        SCALES[scale].forEach((_, i) => {
            const x = (i / SCALES[scale].length) * canvas.width;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        });
        for (let oct = 0; oct <= 3; oct++) {
            const y = canvas.height - (oct / 3) * canvas.height;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Trail
        trailRef.current = trailRef.current.filter(p => p.age < 40).map(p => ({ ...p, age: p.age + 1 }));
        trailRef.current.forEach(p => {
            const alpha = 1 - p.age / 40;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 * alpha, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(p.x / canvas.width) * 360}, 80%, 60%, ${alpha})`;
            ctx.fill();
        });

        // Cursor dot
        const cx = posRef.current.x * canvas.width;
        const cy = posRef.current.y * canvas.height;
        const hue = posRef.current.x * 360;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.fill();
    }, [scale]);

    const loop = useCallback(() => {
        drawCanvas();
        animRef.current = requestAnimationFrame(loop);
    }, [drawCanvas]);

    const start = useCallback(() => {
        const audioCtx = new AudioContext();
        ctxAudioRef.current = audioCtx;
        // コンプレッサーで音量の急激な変化を抑制
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 10;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.005;
        compressor.release.value = 0.15;
        compressor.connect(audioCtx.destination);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.connect(compressor);
        gainRef.current = gain;
        const osc = audioCtx.createOscillator();
        osc.type = waveform;
        // 初期音程をキャンバス中央 (C4) に設定
        osc.frequency.setValueAtTime(freqForNote(60), audioCtx.currentTime);
        osc.connect(gain);
        osc.start();
        oscRef.current = osc;
        setPlaying(true);
        animRef.current = requestAnimationFrame(loop);
    }, [waveform, loop]);

    const stop = useCallback(() => {
        oscRef.current?.stop();
        ctxAudioRef.current?.close();
        oscRef.current = null;
        ctxAudioRef.current = null;
        cancelAnimationFrame(animRef.current);
        setPlaying(false);
    }, []);

    useEffect(() => () => { stop(); }, [stop]);

    const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        posRef.current = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
        trailRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, age: 0 });

        if (oscRef.current && ctxAudioRef.current) {
            const semitone = noteFromPos(x, y);
            const freq = freqForNote(semitone);
            oscRef.current.frequency.setTargetAtTime(freq, ctxAudioRef.current.currentTime, 0.05);
        }
    }, [noteFromPos]);

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
                <button onClick={playing ? stop : start}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm transition-opacity hover:opacity-80 ${playing ? "bg-red-500 text-white" : "bg-ink text-surface"}`}>
                    {playing ? <><FiSquare size={14} /> 停止</> : <><FiPlay size={14} /> 再生</>}
                </button>
                <div className="flex gap-1">
                    {(Object.keys(SCALES) as ScaleKey[]).map(s => (
                        <button key={s} onClick={() => setScale(s)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${scale === s ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                            {SCALE_LABELS[s]}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1">
                    {(["sine", "square", "sawtooth", "triangle"] as OscillatorType[]).map(w => (
                        <button key={w} onClick={() => { setWaveform(w); if (oscRef.current) oscRef.current.type = w; }}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${waveform === w ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <canvas ref={canvasRef} width={600} height={360}
                className="w-full rounded-2xl border border-line cursor-crosshair bg-surface-alt"
                onMouseMove={handleMove}
            />
            <p className="text-xs text-muted">← X: 音程（{SCALE_LABELS[scale]}スケール） ↕ Y: オクターブ（上=高音 / 下=低音）</p>
        </div>
    );
}
