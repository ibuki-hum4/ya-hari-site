"use client";

import { useState, useCallback } from "react";
import { IoMailOutline, IoSendOutline } from "react-icons/io5";
import { FiGithub, FiMessageCircle, FiUser, FiMail, FiFileText } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import Header from "../components/header";
import Footer from "../components/footer";
import Turnstile from "../components/Turnstile";
import Section from "../components/ui/section";
import { cardClass } from "../components/ui/card";
import { primaryButtonClass } from "../components/ui/button";
import { FieldLabel, TextField, TextAreaField, SelectField, FieldError } from "../components/ui/field";
import Reveal from "../components/ui/reveal";
import { contactFormSchema, type ContactValidationKey } from "../../lib/contact-schema";
import { useTranslations } from "next-intl";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function ContactPage() {
    const t = useTranslations("contact");
    const tValidation = useTranslations("contact.form.validation");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        type: "",
        subject: "",
        message: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, ContactValidationKey>>>({});
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token);
    }, []);

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };

    const contactMethods = [
        {
            icon: <IoMailOutline size={24} />,
            title: "EMAIL",
            subtitle: "yahari@skyia.jp",
            description: t("methods.email.description"),
            link: "mailto:yahari@skyia.jp",
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

        // Zodスキーマでクライアント側バリデーション
        const result = contactFormSchema.safeParse({ ...formData, turnstileToken });
        if (!result.success) {
            const errors: Partial<Record<keyof typeof formData, ContactValidationKey>> = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof typeof formData;
                if (!errors[field]) errors[field] = issue.message as ContactValidationKey;
            }
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});

        // Turnstileトークンのチェック
        if (TURNSTILE_SITE_KEY && !turnstileToken) {
            toast.error(t("form.error"));
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.data),
            });

            if (response.ok) {
                toast.success(t("form.success"));
                setFormData({ name: "", email: "", type: "", subject: "", message: "" });
            } else {
                toast.error(t("form.error"));
            }
        } catch {
            toast.error(t("form.error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-20">
                <Section>
                    {/* ヘッダー */}
                    <Reveal>
                        <div className="text-center mb-10 sm:mb-16">
                            <p className="text-sm text-muted mb-2 tracking-widest">CONTACT</p>
                            <h1 className="text-heading font-bold text-ink mb-4">
                                {t("heading")}
                            </h1>
                            <p className="text-muted max-w-2xl mx-auto whitespace-pre-line">
                                {t("description")}
                            </p>
                        </div>
                    </Reveal>

                    {/* ステータス */}
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10 sm:mb-16">
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>{t("responseTime")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <FiMessageCircle size={16} />
                            <span>{t("language")}</span>
                        </div>
                    </div>

                    <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
                        {/* フォーム */}
                        <Reveal className="bg-surface border border-line rounded-2xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-ink mb-6">{t("sendMessage")}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 名前 */}
                                <div>
                                    <FieldLabel>
                                        <FiUser size={16} />
                                        {t("form.name")} <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <TextField
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        placeholder={t("form.namePlaceholder")}
                                    />
                                    <FieldError>{fieldErrors.name && tValidation(fieldErrors.name)}</FieldError>
                                </div>

                                {/* メールアドレス */}
                                <div>
                                    <FieldLabel>
                                        <FiMail size={16} />
                                        {t("form.email")} <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <TextField
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder={t("form.emailPlaceholder")}
                                    />
                                    <FieldError>{fieldErrors.email && tValidation(fieldErrors.email)}</FieldError>
                                </div>

                                {/* お問い合わせの種類 */}
                                <div>
                                    <FieldLabel>{t("form.type")}</FieldLabel>
                                    <SelectField
                                        value={formData.type}
                                        onChange={(e) => updateField("type", e.target.value)}
                                    >
                                        <option value="">{t("form.typeSelect")}</option>
                                        {inquiryTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </SelectField>
                                </div>

                                {/* 件名 */}
                                <div>
                                    <FieldLabel>
                                        <FiFileText size={16} />
                                        {t("form.subject")} <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <TextField
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => updateField("subject", e.target.value)}
                                        placeholder={t("form.subjectPlaceholder")}
                                    />
                                    <FieldError>{fieldErrors.subject && tValidation(fieldErrors.subject)}</FieldError>
                                </div>

                                {/* メッセージ */}
                                <div>
                                    <FieldLabel>
                                        {t("form.message")} <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <TextAreaField
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => updateField("message", e.target.value)}
                                        placeholder={t("form.messagePlaceholder")}
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        <FieldError>{fieldErrors.message && tValidation(fieldErrors.message)}</FieldError>
                                        <p className="text-xs text-muted shrink-0">
                                            {formData.message.length} / 5000
                                        </p>
                                    </div>
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
                                    disabled={isSubmitting || !!(TURNSTILE_SITE_KEY && !turnstileToken)}
                                    className={`w-full ${primaryButtonClass}`}
                                >
                                    <IoSendOutline size={20} />
                                    {isSubmitting ? t("form.submitting") : t("form.submit")}
                                </button>

                            </form>
                        </Reveal>

                        {/* 連絡方法 */}
                        <Reveal delay={0.1} className="space-y-6">
                            <h2 className="text-2xl font-bold text-ink mb-6">{t("otherMethods")}</h2>
                            {contactMethods.map((method, index) => (
                                <Reveal key={method.title} delay={Math.min(index, 2) * 0.1}>
                                    <a
                                        href={method.link}
                                        target={method.link.startsWith("mailto") ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        className={`group block ${cardClass} p-6`}
                                    >
                                        <div className="flex items-center gap-3 mb-3 text-muted">
                                            {method.icon}
                                            <span className="font-semibold text-sm tracking-wider">{method.title}</span>
                                        </div>
                                        <p className="text-ink font-medium mb-2">{method.subtitle}</p>
                                        <p className="text-muted text-sm mb-4">{method.description}</p>
                                        <span className="text-muted text-sm group-hover:text-ink transition-colors">
                                            {method.linkText}
                                        </span>
                                    </a>
                                </Reveal>
                            ))}
                        </Reveal>
                    </div>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
