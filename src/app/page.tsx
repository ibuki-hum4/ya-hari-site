import dynamic from "next/dynamic";
import Header from "./components/header";
import Footer from "./components/footer";
import Hero from "./components/hero";
import About from "./components/about";
import Projects from "./components/projects";
import Skills from "./components/skills";
import Contact from "./components/contact";
import Contributions from "./components/contributions";

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
