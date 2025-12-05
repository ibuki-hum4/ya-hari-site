"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiAlignLeft, FiGrid, FiBox, FiShield, FiSettings, FiFileText } from "react-icons/fi";
import { IoMailOutline, IoEyeOutline } from "react-icons/io5";

const navLinks = [
  { href: "/#about", label: "About", icon: FiAlignLeft },
  { href: "/#projects", label: "Projects", icon: FiGrid },
  { href: "/#skills", label: "Skills", icon: FiBox },
  { href: "/blog", label: "Blog", icon: FiFileText },
  { href: "/#contact", label: "Contact", icon: IoMailOutline },
];

export default function Footer() {
  const [visitors, setVisitors] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // ホームページの場合のみカウントアップ
        if (pathname === "/") {
          const res = await fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "site" }),
          });
          const data = await res.json();
          setVisitors(data.count);
        } else {
          // 他のページでは取得のみ
          const res = await fetch("/api/views?type=site");
          const data = await res.json();
          setVisitors(data.count);
        }
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    trackVisitor();
  }, [pathname]);

  const handleCookieSettings = () => {
    // Cookie同意をリセットして再表示
    localStorage.removeItem("cookie-consent");
    window.location.reload();
  };

  return (
    <footer className="w-full bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-gray-200 py-8 px-4 sm:px-8 shadow-md">
      <div className="max-w-6xl mx-auto">
        {/* モバイル: ナビリンク（横並び） */}
        <div className="flex md:hidden flex-wrap justify-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          {navLinks.map(({ href, label }) => (
            <a 
              key={href}
              href={href} 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* 左カラム */}
          <div className="flex-[2] flex flex-col text-center md:text-left">
            <p className="font-bold text-lg text-gray-900 dark:text-white select-none">やーはり</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 select-none"><a href="mailto:yahari@mail.skyia.jp">yahari@mail.skyia.jp</a></p>
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400 select-none">&copy; {new Date().getFullYear()} やーはり. All rights reserved.</p>
            {/* 訪問者数 */}
            <p className="text-xs mt-2 text-gray-500 dark:text-gray-500 select-none flex items-center justify-center md:justify-start gap-1">
              <IoEyeOutline size={14} />
              <span>{visitors !== null ? `${visitors.toLocaleString()} visitors` : "..."}</span>
            </p>
          </div>

          {/* 中央カラム（モバイルでは非表示） */}
          <div className="hidden md:flex flex-1 flex-col items-center gap-3">
            <a href="/privacy" className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <FiShield size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[150px] group-hover:ml-2 transition-all duration-300 ease-out">Privacy Policy</span>
            </a>
            <button 
              onClick={handleCookieSettings}
              className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FiSettings size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[150px] group-hover:ml-2 transition-all duration-300 ease-out">Cookie Settings</span>
            </button>
          </div>

          {/* 右カラム（デスクトップのみ） */}
          <div className="hidden md:flex flex-[1] flex-col items-end gap-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <a 
                key={href}
                href={href} 
                className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Icon size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* モバイル: プライバシー・クッキー設定 */}
        <div className="flex md:hidden justify-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <a href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Privacy
          </a>
          <button 
            onClick={handleCookieSettings}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cookie Settings
          </button>
        </div>
      </div>
    </footer>
  );
}
