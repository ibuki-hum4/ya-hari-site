"use client";

import { IoMailOutline, IoArrowForward } from "react-icons/io5";
import { FiGithub, FiClock, FiGlobe } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

export default function ContactSection() {
    const contactMethods = [
        {
            icon: <IoMailOutline size={28} />,
            title: "EMAIL",
            subtitle: "yahari@mail.skyia.jp",
            link: "mailto:yahari@mail.skyia.jp",
            color: "from-blue-500/10 to-blue-600/10",
            hoverColor: "group-hover:text-blue-600",
        },
        {
            icon: <FiGithub size={28} />,
            title: "GITHUB",
            subtitle: "@ibuki-hum4",
            link: "https://github.com/ibuki-hum4",
            color: "from-gray-500/10 to-gray-600/10",
            hoverColor: "group-hover:text-gray-900",
        },
        {
            icon: <FaXTwitter size={28} />,
            title: "X",
            subtitle: "@Yaaaaahari",
            link: "https://x.com/Yaaaaahari",
            color: "from-slate-500/10 to-slate-600/10",
            hoverColor: "group-hover:text-slate-900",
        },
    ];

    return (
        <section id="contact" className="py-24 px-8 relative overflow-hidden">
            {/* 背景装飾 */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-gray-100 -z-10" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10" />

            <div className="max-w-5xl mx-auto">
                {/* ヘッダー */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300" />
                        <span className="text-xs font-medium text-gray-400 tracking-[0.3em]">CONTACT</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6">
                        その想像は世界を変える
                    </h2>
                    <p className="text-gray-500 text-center max-w-xl mx-auto leading-relaxed">
                        新しいプロジェクト、技術的な相談、ただの雑談でも。
                        <br className="hidden md:block" />
                        お気軽にご相談ください。
                    </p>
                </div>

                {/* ステータスバッジ */}
                <div className="flex justify-center gap-4 mb-14">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-gray-600">オープン</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                        <FiClock size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">3-4日で返信</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                        <FiGlobe size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">日本語</span>
                    </div>
                </div>

                {/* 連絡方法カード */}
                <div className="grid md:grid-cols-3 gap-5 mb-14">
                    {contactMethods.map((method) => (
                        <a
                            key={method.title}
                            href={method.link}
                            target={method.link.startsWith("mailto") ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            className={`group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
                        >
                            {/* グラデーション背景 */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            
                            <div className="relative">
                                <div className={`mb-4 text-gray-600 transition-colors duration-300 ${method.hoverColor}`}>
                                    {method.icon}
                                </div>
                                <p className="text-xs font-semibold tracking-wider text-gray-400 mb-1">{method.title}</p>
                                <p className="text-gray-900 font-medium text-lg">{method.subtitle}</p>
                                
                                {/* ホバー時の矢印 */}
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    <IoArrowForward size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/contact"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20"
                    >
                        <IoMailOutline size={22} />
                        <span className="font-medium">フォームで問い合わせる</span>
                        <IoArrowForward size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <p className="mt-4 text-sm text-gray-400">または上のリンクから直接連絡できます</p>
                </div>
            </div>
        </section>
    );
}
