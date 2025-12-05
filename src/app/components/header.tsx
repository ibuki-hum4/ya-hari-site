"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // モバイルメニューが開いている時はスクロールを無効化
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname !== "/") {
      e.preventDefault();
      window.location.href = href;
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full backdrop-blur-md p-4 z-50 transition-all duration-300 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        ${isScrolled 
          ? "bg-white/80 dark:bg-gray-900/80 shadow-md" 
          : "bg-white/50 dark:bg-gray-900/50 shadow-sm"}`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <a href="/" className="text-xl sm:text-2xl font-bold select-none hover:opacity-80 transition-opacity text-gray-900 dark:text-white">やーはり</a>
        
        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="relative text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-600 dark:after:bg-gray-300 after:transition-all after:duration-200 hover:after:w-full"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              {label}
            </a>
          ))}
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </nav>

        {/* モバイルメニューボタン */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="メニューを開く"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div 
        className={`md:hidden fixed left-0 right-0 bg-white dark:bg-gray-900 z-[9999] overflow-y-auto shadow-lg transition-all duration-300 ${
          isMobileMenuOpen 
            ? "opacity-100 visible translate-y-0" 
            : "opacity-0 invisible -translate-y-2"
        }`}
        style={{ top: "60px", maxHeight: "calc(100vh - 60px)" }}
      >
        <nav className="flex flex-col py-4 border-t border-gray-200 dark:border-gray-700">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="px-6 py-4 text-lg font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
