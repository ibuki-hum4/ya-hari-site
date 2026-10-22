// プロジェクト一覧の元データ。タイトル・説明は messages の projects.items.<key> にある
// slug はターミナルの仮想ファイル名（projects/<slug>.md）に使う

export type ProjectEntry = {
    key: "bluearchive" | "school" | "alt";
    slug: string;
    status: "completed" | "in-progress";
    links?: {
        demo?: string;
        github?: string;
        invite?: string;
    };
};

export const projectEntries: ProjectEntry[] = [
    {
        key: "bluearchive",
        slug: "bluearchive-api",
        status: "completed",
        links: {
            demo: "https://bluearchive-api.skyia.jp/",
            github: "https://github.com/ibuki-hum4/BlueArchiveAPI",
        },
    },
    {
        key: "school",
        slug: "school-sns-lms",
        status: "in-progress",
    },
    {
        key: "alt",
        slug: "alt-bot",
        status: "completed",
    },
];
