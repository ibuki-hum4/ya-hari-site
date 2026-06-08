"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { FiAlignLeft, FiGrid, FiBox, FiFileText, FiTool } from "react-icons/fi";
import { IoMailOutline } from "react-icons/io5";

const navLinks = [
  { href: "/about", label: "About", icon: FiAlignLeft },
  { href: "/projects", label: "Projects", icon: FiGrid },
  { href: "/skills", label: "Skills", icon: FiBox },
  { href: "/tools", label: "Tools", icon: FiTool },
  { href: "/blog", label: "Blog", icon: FiFileText },
  { href: "/#contact", label: "Contact", icon: IoMailOutline },
];

// 三本線 ⇄ ✕ にモーフィングするハンバーガーアイコン
function HamburgerIcon({ open }: { open: boolean }) {
  const lineClass = "absolute left-0 h-[2px] w-6 rounded-full bg-ink";
  return (
    <span className="relative block w-6 h-6">
      <motion.span
        className={lineClass}
        animate={open ? { top: "50%", rotate: 45, translateY: "-50%" } : { top: "25%", rotate: 0, translateY: "-50%" }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className={lineClass}
        style={{ top: "50%", translateY: "-50%" }}
        animate={open ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className={lineClass}
        animate={open ? { top: "50%", rotate: -45, translateY: "-50%" } : { top: "75%", rotate: 0, translateY: "-50%" }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}

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

  // Escキーでメニューを閉じる、デスクトップ幅にリサイズされたら自動で閉じる
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
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
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="p-2 text-ink hover:bg-ink/5 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isMobileMenuOpen}
          >
            <HamburgerIcon open={isMobileMenuOpen} />
          </motion.button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 背景オーバーレイ: タップで閉じる */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-ink/30 z-[9998]"
              style={{ top: "60px" }}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden fixed left-0 right-0 bg-surface-alt z-[9999] overflow-y-auto shadow-lg rounded-b-2xl"
              style={{ top: "60px", maxHeight: "calc(100vh - 60px)" }}
            >
              <nav className="flex flex-col py-2 border-t border-line">
                {navLinks.map(({ href, label, icon: Icon }, index) => (
                  <motion.a
                    key={href}
                    href={href}
                    onClick={(e) => handleNavClick(e, href)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-4 px-6 py-4 text-lg font-medium text-ink active:bg-ink/5 transition-colors border-b border-line"
                  >
                    <Icon size={20} className="text-muted" />
                    {label}
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
