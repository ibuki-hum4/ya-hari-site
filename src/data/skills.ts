// スキル一覧の元データ。アイコンは表示側（skills/page.tsx）で name から引く
// ここに react-icons を持たせないのは、ターミナルの chunk にアイコンを巻き込まないため

export type SkillEntry = {
    name: string;
    ja: string;
    en: string;
};

export const skillEntries: SkillEntry[] = [
    { name: "React", ja: "UIライブラリ", en: "UI Library" },
    { name: "Next.js", ja: "Reactフレームワーク", en: "React Framework" },
    { name: "Discord.js", ja: "Discord Bot 用ライブラリ", en: "Discord Bot Library" },
    { name: "Tailwind CSS", ja: "ユーティリティファースト CSS", en: "Utility-first CSS" },
    { name: "Node.js", ja: "JavaScript ランタイム", en: "JavaScript Runtime" },
    { name: "Docker", ja: "コンテナ化プラットフォーム", en: "Containerization Platform" },
    { name: "Kubernetes", ja: "コンテナオーケストレーション", en: "Container Orchestration" },
    { name: "Git", ja: "バージョン管理システム", en: "Version Control System" },
    { name: "GitHub", ja: "コードホスティングサービス", en: "Code Hosting Service" },
    { name: "Figma", ja: "UI デザインツール", en: "UI Design Tool" },
    { name: "Disgo", ja: "Go製の Discord Bot 用ライブラリ", en: "Go library for building Discord bots" },
    { name: "Go", ja: "シンプルで高速なプログラミング言語", en: "Simple, fast programming language" },
    { name: "Ruby", ja: "書きやすく読みやすいプログラミング言語", en: "Easy to write and read programming language" },
    { name: "TypeScript / JavaScript", ja: "型を付けて書ける JavaScript と、そのベースとなる言語", en: "Typed superset of JavaScript, and the language it's built on" },
];
