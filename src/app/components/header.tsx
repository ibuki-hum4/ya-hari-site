"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
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
          ? "bg-surface-alt/80 shadow-md"
          : "bg-surface-alt/50 shadow-sm"}`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <a href="/" className="text-xl sm:text-2xl font-bold select-none hover:opacity-80 transition-opacity text-ink">やーはり</a>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="relative text-ink transition-opacity duration-200 hover:opacity-70 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-ink after:transition-all after:duration-200 hover:after:w-full"
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
            className="p-2 text-ink hover:bg-ink/5 rounded-lg transition-colors"
            aria-label="メニューを開く"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden fixed left-0 right-0 bg-surface-alt z-[9999] overflow-y-auto shadow-lg"
            style={{ top: "60px", maxHeight: "calc(100vh - 60px)" }}
          >
            <nav className="flex flex-col py-4 border-t border-line">
              {navLinks.map(({ href, label }, index) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="px-6 py-4 text-lg font-medium text-ink hover:bg-ink/5 transition-colors border-b border-line"
                >
                  {label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
