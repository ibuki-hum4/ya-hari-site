"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
        <a href="/" className="text-2xl font-bold select-none hover:opacity-80 transition-opacity text-gray-900 dark:text-white">やーはり</a>
        <nav className="flex items-center gap-6">
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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
