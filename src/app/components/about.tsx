"use client";

import { FiMusic, FiServer } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";

export default function About() {
    const hobbies = ["音楽", "ゲーム"];
    const abilities = ["バリトンサックス", "インフラ", "k8s"];

    return (
        <section id="about" className="py-20 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">About</h2>
                
                <div className="grid md:grid-cols-2 gap-12">
                    {/* プロフィール */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">やーはり</h3>
                        <p className="text-gray-600 mb-6">14歳 / 中学2年生</p>
                        
                        {/* 趣味 */}
                        <div className="flex items-center gap-2 mb-4">
                            <IoGameControllerOutline size={20} className="text-gray-700" />
                            <FiMusic size={20} className="text-gray-700" />
                            <span className="text-gray-600">{hobbies.join("、")}</span>
                        </div>
                    </div>

                    {/* できること */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FiServer size={20} className="text-gray-700" />
                            <h3 className="text-xl font-bold text-gray-900">Abilities</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {abilities.map((ability) => (
                                <span 
                                    key={ability}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
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