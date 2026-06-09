"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { FiUpload, FiDownload } from "react-icons/fi";

export default function MemeGenerator() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [topText, setTopText] = useState("TOP TEXT");
    const [bottomText, setBottomText] = useState("BOTTOM TEXT");
    const [fontSize, setFontSize] = useState(48);
    const [textColor, setTextColor] = useState("#ffffff");
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (img) {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, w, h);
        } else {
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#555";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("画像をアップロードしてください", canvas.width / 2, canvas.height / 2);
        }

        const drawText = (text: string, y: number) => {
            if (!text) return;
            ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
            ctx.textAlign = "center";
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = fontSize * 0.12;
            ctx.lineJoin = "round";
            ctx.strokeText(text, canvas.width / 2, y);
            ctx.fillStyle = textColor;
            ctx.fillText(text, canvas.width / 2, y);
        };

        drawText(topText, fontSize + 10);
        drawText(bottomText, canvas.height - 15);
    }, [img, topText, bottomText, fontSize, textColor, strokeColor]);

    useEffect(() => { draw(); }, [draw]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => setImg(image);
        image.src = url;
        e.target.value = "";
    };

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "meme.png";
        a.click();
    };

    const inputClass = "w-full text-sm px-3 py-2 bg-surface-alt border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-ink/20";

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Canvas */}
                <div className="space-y-3">
                    <canvas ref={canvasRef} width={540} height={420}
                        className="w-full rounded-xl border border-line" />
                    <div className="flex gap-3">
                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer border border-line rounded-xl px-4 py-2.5 text-sm text-muted hover:text-ink transition-colors">
                            <FiUpload size={15} /> 画像を選択
                            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                        </label>
                        <button onClick={download}
                            className="flex-1 flex items-center justify-center gap-2 bg-ink text-surface text-sm rounded-xl px-4 py-2.5 hover:opacity-80 transition-opacity">
                            <FiDownload size={15} /> ダウンロード
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-muted block mb-1.5">Top text</label>
                        <input type="text" value={topText} onChange={e => setTopText(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="text-xs text-muted block mb-1.5">Bottom text</label>
                        <input type="text" value={bottomText} onChange={e => setBottomText(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="text-xs text-muted block mb-1.5">Font size: {fontSize}px</label>
                        <input type="range" min={20} max={100} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-ink" />
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <label className="text-xs text-muted block mb-1.5">文字色</label>
                            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                                className="w-10 h-9 rounded-lg border border-line cursor-pointer bg-transparent" />
                        </div>
                        <div>
                            <label className="text-xs text-muted block mb-1.5">縁取り色</label>
                            <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)}
                                className="w-10 h-9 rounded-lg border border-line cursor-pointer bg-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
