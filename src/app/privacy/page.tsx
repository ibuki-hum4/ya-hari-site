"use client";

import Header from "../components/header";
import Footer from "../components/footer";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
    const t = useTranslations("privacy");
    const items1 = t.raw("section1.items") as string[];
    const items3 = t.raw("section3.items") as string[];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            
            <main className="pt-20">
                <section className="py-20 px-8">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            {t("title")}
                        </h1>
                        
                        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("intro")}
                            </p>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section1.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {t("section1.description")}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                                    {items1.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section2.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {t("section2.description")}
                                </p>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    {t("section2.gaTitle")}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {t("section2.gaDescription")}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("section2.gaDisable")}
                                    <a 
                                        href="https://policies.google.com/technologies/partner-sites" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {t("section2.gaLink")}
                                    </a>
                                    {t("section2.gaEnd")}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section3.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {t("section3.description")}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                                    {items3.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section4.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("section4.description")}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section5.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("section5.description")}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section6.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("section6.description")}
                                    <a 
                                        href="https://www.cloudflare.com/ja-jp/privacypolicy/" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {t("section6.link")}
                                    </a>
                                    {t("section6.end")}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section7.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("section7.description")}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t("section8.title")}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("section8.description")}
                                    <a 
                                        href="/contact" 
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {t("section8.link")}
                                    </a>
                                    {t("section8.end")}
                                </p>
                            </section>

                            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("effectiveDate")}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
