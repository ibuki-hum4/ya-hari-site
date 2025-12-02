"use client";

import { useState, useCallback } from "react";
import { IoMailOutline, IoSendOutline } from "react-icons/io5";
import { FiGithub, FiMessageCircle, FiUser, FiMail, FiFileText } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import Header from "../components/header";
import Footer from "../components/footer";
import Turnstile from "../components/Turnstile";
import { useTranslations } from "next-intl";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function ContactPage() {
    const t = useTranslations("contact");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        type: "",
        subject: "",
        message: "",
    });
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token);
    }, []);

    const contactMethods = [
        {
            icon: <IoMailOutline size={24} />,
            title: "EMAIL",
            subtitle: "yahari@mail.skyia.jp",
            description: t("methods.email.description"),
            link: "mailto:yahari@mail.skyia.jp",
            linkText: t("methods.email.linkText"),
        },
        {
            icon: <FiGithub size={24} />,
            title: "GITHUB",
            subtitle: "@ibuki-hum4",
            description: t("methods.github.description"),
            link: "https://github.com/ibuki-hum4",
            linkText: t("methods.github.linkText"),
        },
        {
            icon: <FaXTwitter size={24} />,
            title: "X",
            subtitle: "@Yaaaaahari",
            description: t("methods.x.description"),
            link: "https://x.com/Yaaaaahari",
            linkText: t("methods.x.linkText"),
        },
    ];

    const inquiryTypes = [
        { value: "project", label: t("form.typeProject") },
        { value: "collaboration", label: t("form.typeCollaboration") },
        { value: "technical", label: t("form.typeTechnical") },
        { value: "other", label: t("form.typeOther") },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Turnstileトークンのチェック
        if (TURNSTILE_SITE_KEY && !turnstileToken) {
            setSubmitStatus("error");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, turnstileToken }),
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
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            
            <main className="pt-20">
                <section className="py-20 px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* ヘッダー */}
                        <div className="text-center mb-16">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-widest">CONTACT</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                {t("heading")}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto whitespace-pre-line">
                                {t("description")}
                            </p>
                        </div>

                        {/* ステータス */}
                        <div className="flex flex-wrap justify-center gap-6 mb-16">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>{t("responseTime")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FiMessageCircle size={16} />
                                <span>{t("language")}</span>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* フォーム */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("sendMessage")}</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* 名前 */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <FiUser size={16} />
                                            {t("form.name")} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none transition-colors"
                                            placeholder={t("form.namePlaceholder")}
                                        />
                                    </div>

                                    {/* メールアドレス */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <FiMail size={16} />
                                            {t("form.email")} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none transition-colors"
                                            placeholder={t("form.emailPlaceholder")}
                                        />
                                    </div>

                                    {/* お問い合わせの種類 */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t("form.type")}
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none transition-colors bg-white dark:bg-gray-700"
                                        >
                                            <option value="">{t("form.typeSelect")}</option>
                                            {inquiryTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 件名 */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <FiFileText size={16} />
                                            {t("form.subject")} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none transition-colors"
                                            placeholder={t("form.subjectPlaceholder")}
                                        />
                                    </div>

                                    {/* メッセージ */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t("form.message")} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none transition-colors resize-none"
                                            placeholder={t("form.messagePlaceholder")}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                            {formData.message.length} / 5000
                                        </p>
                                    </div>

                                    {/* Cloudflare Turnstile */}
                                    {TURNSTILE_SITE_KEY && (
                                        <div className="flex justify-center">
                                            <Turnstile
                                                siteKey={TURNSTILE_SITE_KEY}
                                                onVerify={handleTurnstileVerify}
                                            />
                                        </div>
                                    )}

                                    {/* 送信ボタン */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || (TURNSTILE_SITE_KEY && !turnstileToken)}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <IoSendOutline size={20} />
                                        {isSubmitting ? t("form.submitting") : t("form.submit")}
                                    </button>

                                    {/* ステータスメッセージ */}
                                    {submitStatus === "success" && (
                                        <p className="text-green-600 text-center">{t("form.success")}</p>
                                    )}
                                    {submitStatus === "error" && (
                                        <p className="text-red-600 text-center">{t("form.error")}</p>
                                    )}
                                </form>
                            </div>

                            {/* 連絡方法 */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("otherMethods")}</h2>
                                {contactMethods.map((method) => (
                                    <a
                                        key={method.title}
                                        href={method.link}
                                        target={method.link.startsWith("mailto") ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        className="group block bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-3 text-gray-700 dark:text-gray-300">
                                            {method.icon}
                                            <span className="font-semibold text-sm tracking-wider">{method.title}</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium mb-2">{method.subtitle}</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{method.description}</p>
                                        <span className="text-gray-700 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
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
