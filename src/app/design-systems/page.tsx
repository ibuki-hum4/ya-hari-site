"use client";

import { useTranslations } from "next-intl";
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Card from "../components/ui/card";
import Reveal from "../components/ui/reveal";
import { primaryButtonClass, secondaryButtonClass, compactButtonClass } from "../components/ui/button";
import { FieldLabel, TextField, TextAreaField, SelectField, FieldError } from "../components/ui/field";

const colorTokens = [
    { name: "surface", varName: "--color-surface" },
    { name: "surface-alt", varName: "--color-surface-alt" },
    { name: "ink", varName: "--color-ink" },
    { name: "muted", varName: "--color-muted" },
    { name: "line", varName: "--color-line" },
    { name: "accent", varName: "--color-accent" },
];

const typographyTokens = [
    { name: "display", varName: "--text-display", className: "text-display font-bold" },
    { name: "heading", varName: "--text-heading", className: "text-heading font-bold" },
    { name: "subheading", varName: "--text-subheading", className: "text-subheading font-medium" },
];

const spacingTokens = [
    { name: "space-sm", varName: "--space-sm" },
    { name: "space-md", varName: "--space-md" },
    { name: "space-lg", varName: "--space-lg" },
];

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">{title}</h2>
            <p className="text-sm text-muted max-w-2xl">{description}</p>
        </div>
    );
}

export default function DesignSystemsPage() {
    const t = useTranslations("designSystem");

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="pt-20 flex-1">
                <Section>
                    {/* ヘッダー */}
                    <Reveal>
                        <div className="text-center mb-12 sm:mb-20">
                            <p className="text-sm text-muted mb-2 tracking-widest">{t("label")}</p>
                            <h1 className="text-heading font-bold text-ink mb-4">{t("title")}</h1>
                            <p className="text-muted max-w-2xl mx-auto leading-relaxed">{t("description")}</p>
                        </div>
                    </Reveal>

                    <div className="space-y-16 sm:space-y-24">
                        {/* カラー */}
                        <Reveal>
                            <SectionHeader title={t("sections.colors.title")} description={t("sections.colors.description")} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {colorTokens.map((token) => (
                                    <div key={token.name} className="text-center">
                                        <div
                                            className="aspect-square rounded-2xl border border-line shadow-sm mb-3"
                                            style={{ background: `var(${token.varName})` }}
                                        />
                                        <p className="text-sm font-medium text-ink">{token.name}</p>
                                        <p className="text-xs text-muted font-mono">{token.varName}</p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>

                        {/* タイポグラフィ */}
                        <Reveal>
                            <SectionHeader title={t("sections.typography.title")} description={t("sections.typography.description")} />
                            <div className="space-y-6">
                                {typographyTokens.map((token) => (
                                    <div key={token.name} className="border-b border-line pb-6">
                                        <p className={`${token.className} text-ink mb-2`}>Aa やーはり</p>
                                        <p className="text-xs text-muted font-mono">{token.name} — {token.varName}</p>
                                    </div>
                                ))}
                                <div className="border-b border-line pb-6">
                                    <p className="text-ink mb-2">Aa やーはり — Body text (text-ink)</p>
                                    <p className="text-muted font-mono text-xs">text-muted — secondary / supporting text</p>
                                </div>
                            </div>
                        </Reveal>

                        {/* スペーシング */}
                        <Reveal>
                            <SectionHeader title={t("sections.spacing.title")} description={t("sections.spacing.description")} />
                            <div className="space-y-4">
                                {spacingTokens.map((token) => (
                                    <div key={token.name} className="flex items-center gap-4">
                                        <p className="w-28 shrink-0 text-sm font-mono text-muted">{token.varName}</p>
                                        <div className="flex-1 bg-ink/5 rounded-lg overflow-hidden">
                                            <div
                                                className="bg-ink/20 h-6"
                                                style={{ width: `var(${token.varName})`, maxWidth: "100%" }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>

                        {/* ボタン */}
                        <Reveal>
                            <SectionHeader title={t("sections.buttons.title")} description={t("sections.buttons.description")} />
                            <div className="flex flex-wrap items-center gap-4">
                                <button className={primaryButtonClass}>Primary</button>
                                <button className={secondaryButtonClass}>Secondary</button>
                                <button className={compactButtonClass}>Compact</button>
                                <button className={primaryButtonClass} disabled>Disabled</button>
                            </div>
                        </Reveal>

                        {/* カード */}
                        <Reveal>
                            <SectionHeader title={t("sections.cards.title")} description={t("sections.cards.description")} />
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-bold text-ink mb-2">{t("sampleCard.title")}</h3>
                                    <p className="text-muted text-sm">{t("sampleCard.description")}</p>
                                </Card>
                            </div>
                        </Reveal>

                        {/* フォーム */}
                        <Reveal>
                            <SectionHeader title={t("sections.forms.title")} description={t("sections.forms.description")} />
                            <div className="max-w-md space-y-6">
                                <div>
                                    <FieldLabel>{t("sampleField.label")}</FieldLabel>
                                    <TextField type="text" placeholder={t("sampleField.placeholder")} />
                                </div>
                                <div>
                                    <FieldLabel>{t("sampleField.label")}</FieldLabel>
                                    <TextAreaField rows={3} placeholder={t("sampleField.placeholder")} />
                                </div>
                                <div>
                                    <FieldLabel>{t("sampleField.label")}</FieldLabel>
                                    <SelectField defaultValue="">
                                        <option value="" disabled>{t("sampleField.placeholder")}</option>
                                        <option value="a">A</option>
                                        <option value="b">B</option>
                                    </SelectField>
                                </div>
                                <div>
                                    <FieldLabel>{t("sampleField.label")}</FieldLabel>
                                    <TextField type="text" placeholder={t("sampleField.placeholder")} />
                                    <FieldError>{t("sampleField.error")}</FieldError>
                                </div>
                            </div>
                        </Reveal>

                        {/* バッジ・ステータス */}
                        <Reveal>
                            <SectionHeader title={t("sections.badges.title")} description={t("sections.badges.description")} />
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-2 py-1 border border-line text-muted rounded-full text-xs">
                                    {t("badgeProgress")}
                                </span>
                                <span className="inline-block px-3 py-1 text-xs font-medium border border-line text-muted rounded-full">
                                    Category
                                </span>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-line">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                    </span>
                                    <span className="text-sm text-muted">{t("badgeOpen")}</span>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
