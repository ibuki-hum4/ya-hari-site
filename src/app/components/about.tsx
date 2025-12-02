"use client";

import { FiMusic, FiServer } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";

export default function About() {
    const t = useTranslations("about");
    const hobbies = ["音楽", "ゲーム"];
    const abilities = ["バリトンサックス", "インフラ", "k8s"];

    return (
        <section id="about" className="py-20 px-8 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t("title")}</h2>
                
                <div className="grid md:grid-cols-2 gap-12">
                    {/* プロフィール */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("name")}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{t("age")} / {t("school")}</p>
                        
                        {/* 趣味 */}
                        <div className="flex items-center gap-2 mb-4">
                            <IoGameControllerOutline size={20} className="text-gray-700 dark:text-gray-300" />
                            <FiMusic size={20} className="text-gray-700 dark:text-gray-300" />
                            <span className="text-gray-600 dark:text-gray-300">{hobbies.join("、")}</span>
                        </div>
                    </div>

                    {/* できること */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FiServer size={20} className="text-gray-700 dark:text-gray-300" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Abilities</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {abilities.map((ability) => (
                                <span 
                                    key={ability}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-sm"
                                >
                                    {ability}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}