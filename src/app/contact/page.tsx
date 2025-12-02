"use client";

import { useState } from "react";
import { IoMailOutline, IoSendOutline } from "react-icons/io5";
import { FiGithub, FiMessageCircle, FiUser, FiMail, FiFileText } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        type: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const contactMethods = [
        {
            icon: <IoMailOutline size={24} />,
            title: "EMAIL",
            subtitle: "yahari@mail.skyia.jp",
            description: "プロジェクトのご相談、お仕事のご依頼はメールでお気軽にどうぞ。",
            link: "mailto:yahari@mail.skyia.jp",
            linkText: "送信する →",
        },
        {
            icon: <FiGithub size={24} />,
            title: "GITHUB",
            subtitle: "@ibuki-hum4",
            description: "オープンソースプロジェクトやコード作品をご覧いただけます。",
            link: "https://github.com/ibuki-hum4",
            linkText: "アクセスする →",
        },
        {
            icon: <FaXTwitter size={24} />,
            title: "X",
            subtitle: "@Yaaaaahari",
            description: "日々の活動や技術に関する情報を発信しています。",
            link: "https://x.com/Yaaaaahari",
            linkText: "アクセスする →",
        },
    ];

    const inquiryTypes = [
        { value: "project", label: "プロジェクトの相談" },
        { value: "collaboration", label: "コラボレーション" },
        { value: "technical", label: "技術的な質問" },
        { value: "other", label: "その他" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus("success");
                setFormData({ name: "", email: "", type: "", subject: "", message: "" });
            } else {
                setSubmitStatus("error");
            }
        } catch {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />
            
            <main className="pt-20">
                <section className="py-20 px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* ヘッダー */}
                        <div className="text-center mb-16">
                            <p className="text-sm text-gray-500 mb-2 tracking-widest">CONTACT</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                その想像は世界を変える
                            </h1>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                新しいプロジェクト、技術的な相談、ただの雑談でも。
                                お気軽にご相談ください。
                            </p>
                        </div>

                        {/* ステータス */}
                        <div className="flex flex-wrap justify-center gap-6 mb-16">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>3-4日で返信</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiMessageCircle size={16} />
                                <span>日本語</span>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* フォーム */}
                            <div className="bg-gray-50 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">メッセージを送る</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* 名前 */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <FiUser size={16} />
                                            お名前 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors"
                                            placeholder="山田 太郎"
                                        />
                                    </div>

                                    {/* メールアドレス */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <FiMail size={16} />
                                            メールアドレス <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors"
                                            placeholder="example@email.com"
                                        />
                                    </div>

                                    {/* お問い合わせの種類 */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            お問い合わせの種類
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors bg-white"
                                        >
                                            <option value="">選択してください</option>
                                            {inquiryTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 件名 */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <FiFileText size={16} />
                                            件名 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors"
                                            placeholder="お問い合わせの件名"
                                        />
                                    </div>

                                    {/* メッセージ */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            メッセージ <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors resize-none"
                                            placeholder="お問い合わせ内容をご記入ください"
                                        />
                                        <p className="text-xs text-gray-500 mt-1 text-right">
                                            {formData.message.length} / 5000
                                        </p>
                                    </div>

                                    {/* 送信ボタン */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <IoSendOutline size={20} />
                                        {isSubmitting ? "送信中..." : "送信する"}
                                    </button>

                                    {/* ステータスメッセージ */}
                                    {submitStatus === "success" && (
                                        <p className="text-green-600 text-center">送信完了！ありがとうございます。</p>
                                    )}
                                    {submitStatus === "error" && (
                                        <p className="text-red-600 text-center">送信に失敗しました。もう一度お試しください。</p>
                                    )}
                                </form>
                            </div>

                            {/* 連絡方法 */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">その他の方法</h2>
                                {contactMethods.map((method) => (
                                    <a
                                        key={method.title}
                                        href={method.link}
                                        target={method.link.startsWith("mailto") ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        className="group block bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-3 text-gray-700">
                                            {method.icon}
                                            <span className="font-semibold text-sm tracking-wider">{method.title}</span>
                                        </div>
                                        <p className="text-gray-900 font-medium mb-2">{method.subtitle}</p>
                                        <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                                        <span className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
                                            {method.linkText}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
