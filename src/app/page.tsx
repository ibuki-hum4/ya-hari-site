import dynamic from "next/dynamic";
import Header from "./components/header";
import Footer from "./components/footer";
import Hero from "./components/hero";
import Contributions from "./components/contributions";

// Above-the-fold以外のコンポーネントを遅延読み込み
const About = dynamic(() => import("./components/about"), {
  loading: () => <div className="min-h-[400px]" />,
});
const Projects = dynamic(() => import("./components/projects"), {
  loading: () => <div className="min-h-[400px]" />,
});
const Skills = dynamic(() => import("./components/skills"), {
  loading: () => <div className="min-h-[400px]" />,
});
const MutualLinks = dynamic(() => import("./components/mlink"), {
  loading: () => <div className="min-h-[400px]" />,
});
const Contact = dynamic(() => import("./components/contact"), {
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
