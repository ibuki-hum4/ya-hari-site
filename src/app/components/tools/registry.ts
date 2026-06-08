import { IconType } from "react-icons";
import { FiKey } from "react-icons/fi";

export type ToolEntry = {
    // messages の `tools.items.<key>` と対応する翻訳キー
    key: string;
    href: string;
    icon: IconType;
    status: "available" | "comingSoon";
};

// 新しいツールを追加する場合は、ここに1エントリ追加し
// `tools.items.<key>` の翻訳と `/tools/<slug>/page.tsx` を用意するだけでよい
export const toolEntries: ToolEntry[] = [
    {
        key: "passwordGenerator",
        href: "/tools/password-generator",
        icon: FiKey,
        status: "available",
    },
];
