import { IconType } from "react-icons";
import {
    FiKey, FiTerminal, FiCode, FiDroplet, FiType, FiFileText,
    FiAlignLeft, FiImage, FiSliders, FiCamera, FiMessageSquare,
    FiZap, FiActivity, FiGrid, FiMusic, FiCpu,
} from "react-icons/fi";

export type ToolEntry = {
    key: string;
    href: string;
    icon: IconType;
    status: "available" | "comingSoon";
};

export const toolEntries: ToolEntry[] = [
    { key: "passwordGenerator",  href: "/tools/password-generator",  icon: FiKey,          status: "available" },
    { key: "jsonFormatter",      href: "/tools/json-formatter",      icon: FiTerminal,     status: "available" },
    { key: "base64Url",          href: "/tools/base64-url",          icon: FiCode,         status: "available" },
    { key: "colorPalette",       href: "/tools/color-palette",       icon: FiDroplet,      status: "available" },
    { key: "typographyPreview",  href: "/tools/typography-preview",  icon: FiType,         status: "available" },
    { key: "markdownHtml",       href: "/tools/markdown-html",       icon: FiFileText,     status: "available" },
    { key: "textCounter",        href: "/tools/text-counter",        icon: FiAlignLeft,    status: "available" },
    { key: "memeGenerator",      href: "/tools/meme-generator",      icon: FiImage,        status: "available" },
    { key: "yamlJson",           href: "/tools/yaml-json",           icon: FiSliders,      status: "available" },
    { key: "imageColor",         href: "/tools/image-color",         icon: FiCamera,       status: "available" },
    { key: "excuseGenerator",    href: "/tools/excuse-generator",    icon: FiMessageSquare,status: "available" },
    { key: "cookieClicker",      href: "/tools/cookie-clicker",      icon: FiZap,          status: "available" },
    { key: "typingSpeed",        href: "/tools/typing-speed",        icon: FiActivity,     status: "available" },
    { key: "yardle",             href: "/tools/yardle",              icon: FiGrid,         status: "available" },
    { key: "mouseMusic",         href: "/tools/mouse-music",         icon: FiMusic,        status: "available" },
    { key: "noneAI",             href: "/tools/none-ai",             icon: FiCpu,          status: "available" },
];
