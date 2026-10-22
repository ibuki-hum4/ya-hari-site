// 相互リンクの元データ

export type FriendLink = {
    name?: string; // サイト名（省略でサイトから自動取得）
    description?: string; // 説明（省略でサイトから自動取得）
    url: string;
    avatar?: string;
};

export const friendLinks: FriendLink[] = [
    {
        url: "https://www.yuito-it.jp",
        avatar: "/yuitopia.gif",
        // name, description省略 → サイトから自動取得
    },
    {
        url: "https://shihiro.com/",
        avatar: "/shihiro-banner.png",
    },
    {
        url: "https://profile.activetk.jp/",
    },
    // 追加する場合はここに追加
];

export type OGPData = { title?: string; description?: string };

// mlink.tsx とターミナルで OGP のキャッシュを共有するためのキー
export const ogpQueryKey = (url: string) => ["ogp", url] as const;
