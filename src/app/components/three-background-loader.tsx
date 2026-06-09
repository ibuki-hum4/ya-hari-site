"use client";

import dynamic from "next/dynamic";

const ThreeBackground = dynamic(() => import("./three-background"), { ssr: false });

export default function ThreeBackgroundLoader() {
    return <ThreeBackground />;
}
