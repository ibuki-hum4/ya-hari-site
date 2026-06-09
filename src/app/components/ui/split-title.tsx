"use client";

import { motion } from "motion/react";

interface SplitTitleProps {
    text: string;
    className?: string;
    delay?: number;
}

// 見出しを1文字ずつ左からスライドインさせる（スクロールで視界に入ったときに発火）
export default function SplitTitle({ text, className = "", delay = 0 }: SplitTitleProps) {
    return (
        <span className={`inline-block max-w-full${className ? ` ${className}` : ""}`} role="text" aria-label={text}>
            {text.split("").map((char, index) => (
                <motion.span
                    key={index}
                    className="inline-block"
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                    transition={{ duration: 0.45, delay: delay + index * 0.035, ease: [0.16, 1, 0.3, 1] }}
                    aria-hidden
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </span>
    );
}
