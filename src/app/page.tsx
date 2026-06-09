import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "./components/header";
import Footer from "./components/footer";
import Hero from "./components/hero";
import About from "./components/about";
import Projects from "./components/projects";
import Skills from "./components/skills";
import Contact from "./components/contact";
import Contributions from "./components/contributions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata: Metadata = {
  title: "やーはり | ポートフォリオ",
  description: "プログラミングとテクノロジーが大好きな14歳の中学生エンジニア、やーはりのポートフォリオ。Next.js・TypeScript・Kubernetes などを使った制作物、技術ブログ、ブラウザで動くツールを公開しています。",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    firstName: "やーはり",
    username: "Yaaaaahari",
    url: siteUrl,
    title: "やーはり | ポートフォリオ",
    description: "14歳の中学生Webエンジニア、やーはりのポートフォリオ。Web開発・インフラ・個人開発に取り組んでいます。",
  },
};

// Client Componentのみ dynamic() で遅延読み込み
const MutualLinks = dynamic(() => import("./components/mlink"), {
  loading: () => <div className="min-h-[400px]" />,
});

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <Contributions />
      <Projects />
      <Skills />
      <MutualLinks />
      <Contact />
      <Footer />
    </div>
  );
}
