import { IconType } from "react-icons";
import {
    FiKey, FiTerminal, FiCode, FiDroplet, FiType, FiFileText,
    FiAlignLeft, FiImage, FiSliders, FiCamera, FiMessageSquare,
    FiZap, FiActivity, FiGrid, FiMusic, FiCpu,
} from "react-icons/fi";

export type ToolCategory = "dev" | "play";

export type ToolEntry = {
    key: string;
    href: string;
    icon: IconType;
    status: "available" | "comingSoon";
    category: ToolCategory;
};

export const toolEntries: ToolEntry[] = [
    { key: "passwordGenerator",  href: "/tools/password-generator",  icon: FiKey,           category: "dev",  status: "available" },
    { key: "jsonFormatter",      href: "/tools/json-formatter",      icon: FiTerminal,      category: "dev",  status: "available" },
    { key: "base64Url",          href: "/tools/base64-url",          icon: FiCode,          category: "dev",  status: "available" },
    { key: "colorPalette",       href: "/tools/color-palette",       icon: FiDroplet,       category: "dev",  status: "available" },
    { key: "typographyPreview",  href: "/tools/typography-preview",  icon: FiType,          category: "dev",  status: "available" },
    { key: "markdownHtml",       href: "/tools/markdown-html",       icon: FiFileText,      category: "dev",  status: "available" },
    { key: "textCounter",        href: "/tools/text-counter",        icon: FiAlignLeft,     category: "dev",  status: "available" },
    { key: "yamlJson",           href: "/tools/yaml-json",           icon: FiSliders,       category: "dev",  status: "available" },
    { key: "imageColor",         href: "/tools/image-color",         icon: FiCamera,        category: "dev",  status: "available" },
    { key: "memeGenerator",      href: "/tools/meme-generator",      icon: FiImage,         category: "play", status: "available" },
    { key: "excuseGenerator",    href: "/tools/excuse-generator",    icon: FiMessageSquare, category: "play", status: "available" },
    { key: "cookieClicker",      href: "/tools/cookie-clicker",      icon: FiZap,           category: "play", status: "available" },
    { key: "typingSpeed",        href: "/tools/typing-speed",        icon: FiActivity,      category: "play", status: "available" },
    { key: "yardle",             href: "/tools/yardle",              icon: FiGrid,          category: "play", status: "available" },
    { key: "mouseMusic",         href: "/tools/mouse-music",         icon: FiMusic,         category: "play", status: "available" },
    { key: "noneAI",             href: "/tools/none-ai",             icon: FiCpu,           category: "play", status: "available" },
];
