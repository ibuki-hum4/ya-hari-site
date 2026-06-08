"use client";

import { motion, type Variants } from "motion/react";
import { ReactNode } from "react";

const variants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

// スクロールで視界に入ったときに、ふわっと浮かび上がるように表示する（一度表示したら戻らない）
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={variants}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}
