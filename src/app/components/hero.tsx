"use client";

import { IoMailOutline } from "react-icons/io5";
import Image from "next/image";
import { memo } from "react";
import { primaryButtonClass } from "./ui/button";
import SplitTitle from "./ui/split-title";

const Hero = memo(function Hero() {
    const profileImage = "/icon.png";

    return (
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-8">
            <div className="max-w-6xl w-full flex flex-col-reverse md:flex-row items-center justify-between gap-8 sm:gap-12">
                {/* 左側: 名前・サブタイトル・ボタン */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                    <h1 className="text-display font-bold text-ink select-none">
                        <SplitTitle text="やーはり" />
                    </h1>
                    <p className="text-subheading text-muted select-none">Full-Stack / Infra Developer</p>
                    <a
                        href="mailto:yahari@skyia.jp"
                        className={`mt-4 ${primaryButtonClass} select-none`}
                    >
                        <IoMailOutline size={20} />
                        Contact
                    </a>
                </div>

                {/* 右側: アイコン */}
                <div className="flex-1 flex justify-center md:justify-end">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full overflow-hidden border border-line">
                        <Image
                            src={profileImage}
                            alt="プロフィール画像"
                            width={256}
                            height={256}
                            className="w-full h-full object-cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
});

export default Hero;
