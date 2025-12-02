import dynamic from "next/dynamic";
import Header from "./components/header";
import Footer from "./components/footer";

// 重いコンポーネントを遅延読み込み
const Hero = dynamic(() => import("./components/hero"), {
  loading: () => <div className="min-h-screen" />,
});
const About = dynamic(() => import("./components/about"));
const Projects = dynamic(() => import("./components/projects"));
const Skills = dynamic(() => import("./components/skills"));
const MutualLinks = dynamic(() => import("./components/mlink"));
const Contact = dynamic(() => import("./components/contact"));

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <MutualLinks />
      <Contact />
      <Footer />
    </div>
  );
}
