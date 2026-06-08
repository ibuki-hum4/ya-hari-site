"use client";

import { useQueries } from "@tanstack/react-query";
import { FiExternalLink } from "react-icons/fi";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Section from "./ui/section";
import { cardClass } from "./ui/card";
import Reveal from "./ui/reveal";

type FriendLink = {
  name?: string; // サイト名（省略でサイトから自動取得）
  description?: string; // 説明（省略でサイトから自動取得）
  url: string;
  avatar?: string;
};

const friendLinks: FriendLink[] = [
  {
    url: "https://www.yuito-it.jp",
    avatar: "/yuitopia.gif",
    // name, description省略 → サイトから自動取得
  },
  {
    url: "https://shihiro.com/",
    avatar: "/shihiro-banner.png",
  },
  // 追加する場合はここに追加
];

type LinkWithOGP = FriendLink & { fetchedName?: string; fetchedDescription?: string };

type OGPData = { title?: string; description?: string };

export default function MutualLinks() {
  const t = useTranslations("links");

  // 名前/説明が省略されているリンクだけOGPを取得し、ページ間遷移時はキャッシュを再利用する
  const ogpQueries = useQueries({
    queries: friendLinks.map((link) => ({
      queryKey: ["ogp", link.url],
      queryFn: async (): Promise<OGPData> => {
        const res = await fetch(`/api/ogp?url=${encodeURIComponent(link.url)}`);
        if (!res.ok) throw new Error("Failed to fetch OGP");
        return res.json();
      },
      enabled: !(link.name && link.description),
      staleTime: Infinity,
    })),
  });

  const links: LinkWithOGP[] = friendLinks.map((link, i) => ({
    ...link,
    fetchedName: link.name ? undefined : ogpQueries[i].data?.title,
    fetchedDescription: link.description ? undefined : ogpQueries[i].data?.description,
  }));

  if (friendLinks.length === 0) return null;

  return (
    <Section id="links">
      {/* ヘッダー */}
      <Reveal>
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-sm text-muted mb-2 tracking-widest">LINKS</p>
          <h2 className="text-heading font-bold text-ink mb-4">
            {t("title")}
          </h2>
          <p className="text-muted">
            {t("description")}
          </p>
        </div>
      </Reveal>

      {/* リンク一覧 - スマホ: 縦並び、デスクトップ: 横並びカード */}
      <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-4 md:gap-6">
        {links.map((link, index) => (
          <Reveal key={link.url} delay={Math.min(index, 2) * 0.1} className="md:w-auto">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-4 p-3 md:p-4 ${cardClass} md:w-auto`}
          >
            {/* 画像エリア - 画像のアスペクト比を維持 */}
            <div className="flex-shrink-0 h-16 md:h-20 flex items-center justify-center">
              {link.avatar ? (
                <Image
                  src={link.avatar}
                  alt={link.name || link.fetchedName || ""}
                  width={200}
                  height={80}
                  className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-ink/5 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted">
                    {(link.name || link.fetchedName || "?").charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* 情報 */}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm md:text-base text-ink group-hover:text-muted transition-colors truncate">
                {link.name || link.fetchedName || new URL(link.url).hostname}
              </p>
              <p className="text-xs md:text-sm text-muted truncate">
                {link.description || link.fetchedDescription || ""}
              </p>
            </div>
            <FiExternalLink
              size={16}
              className="text-muted group-hover:text-ink transition-all flex-shrink-0"
            />
          </a>
          </Reveal>
        ))}
      </div>

      {/* リンク申請 */}
      <Reveal>
        <div className="mt-10 text-center">
          <p className="text-sm text-muted">
            {t("request")}{" "}
            <a href="/#contact" className="text-ink underline underline-offset-2 transition-opacity hover:opacity-70">
              {t("contactLink")}
            </a>
            {" "}{t("requestEnd")}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}