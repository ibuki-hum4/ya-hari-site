"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FiAlignLeft, FiGrid, FiBox, FiShield, FiFileText, FiLayers } from "react-icons/fi";
import { IoMailOutline, IoEyeOutline } from "react-icons/io5";
import CookieSettingsDialog from "./CookieSettingsDialog";

const navLinks = [
  { href: "/#about", label: "About", icon: FiAlignLeft },
  { href: "/#projects", label: "Projects", icon: FiGrid },
  { href: "/#skills", label: "Skills", icon: FiBox },
  { href: "/blog", label: "Blog", icon: FiFileText },
  { href: "/#contact", label: "Contact", icon: IoMailOutline },
];

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // ホームページではカウントアップ、それ以外では取得のみ。pathnameごとにキャッシュして無駄な再取得を防ぐ
  const { data: visitors = null } = useQuery({
    queryKey: ["visitors", isHome ? "track" : "view"],
    queryFn: async () => {
      const res = isHome
        ? await fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "site" }),
          })
        : await fetch("/api/views?type=site");
      const data = await res.json();
      return data.count as number;
    },
  });

  return (
    <footer className="relative border-t border-line bg-surface-alt/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-8" style={{ paddingBlock: "var(--space-md)" }}>
        {/* ブランド・コンタクト */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between text-center sm:text-left mb-10 sm:mb-14">
          <div>
            <p className="text-sm text-muted tracking-widest mb-2 select-none">YAHARI</p>
            <p className="text-heading font-bold text-ink select-none">またのお越しを。</p>
          </div>
          <a
            href="mailto:yahari@skyia.jp"
            className="inline-flex items-center justify-center gap-2 text-sm text-muted hover:text-ink underline underline-offset-4 transition-colors"
          >
            <IoMailOutline size={16} />
            yahari@skyia.jp
          </a>
        </div>

        {/* ナビゲーション */}
        <nav className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3 pb-8 mb-8 border-b border-line">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </nav>

        {/* メタ情報 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 select-none">
            <span>&copy; {new Date().getFullYear()} やーはり. All rights reserved.</span>
            <span className="inline-flex items-center gap-1">
              <IoEyeOutline size={14} />
              {visitors !== null ? `${visitors.toLocaleString()} visitors` : "..."}
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-5">
            <a href="/design-systems" className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
              <FiLayers size={14} />
              Design System
            </a>
            <a href="/privacy" className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
              <FiShield size={14} />
              Privacy Policy
            </a>
            <CookieSettingsDialog />
          </div>
        </div>
      </div>
    </footer>
  );
}
