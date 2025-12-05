"use client";

import { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import Image from "next/image";
import { useTranslations } from "next-intl";

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

export default function MutualLinks() {
  const t = useTranslations("links");
  const [links, setLinks] = useState<LinkWithOGP[]>(friendLinks);

  useEffect(() => {
    const fetchOGP = async () => {
      const updatedLinks = await Promise.all(
        friendLinks.map(async (link) => {
          // 両方手動で指定されている場合はスキップ
          if (link.name && link.description) return link;

          try {
            const res = await fetch(`/api/ogp?url=${encodeURIComponent(link.url)}`);
            if (res.ok) {
              const data = await res.json();
              return {
                ...link,
                fetchedName: link.name ? undefined : data.title,
                fetchedDescription: link.description ? undefined : data.description,
              };
            }
          } catch {
            // エラー時は空のまま
          }
          return link;
        })
      );
      setLinks(updatedLinks);
    };

    fetchOGP();
  }, []);

  if (friendLinks.length === 0) return null;

  return (
    <section id="links" className="py-12 sm:py-20 px-4 sm:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-widest">LINKS</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("description")}
          </p>
        </div>

        {/* リンク一覧 - スマホ: 縦並び、デスクトップ: 横並びカード */}
        <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-4 md:gap-6">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:w-auto"
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
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">
                      {(link.name || link.fetchedName || "?").charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* 情報 */}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors truncate">
                  {link.name || link.fetchedName || new URL(link.url).hostname}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {link.description || link.fetchedDescription || ""}
                </p>
              </div>
              <FiExternalLink 
                size={16} 
                className="text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all flex-shrink-0" 
              />
            </a>
          ))}
        </div>

        {/* リンク申請 */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("request")}{" "}
            <a href="/#contact" className="text-gray-700 dark:text-gray-300 underline hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("contactLink")}
            </a>
            {" "}{t("requestEnd")}
          </p>
        </div>
      </div>
    </section>
  );
}