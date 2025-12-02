"use client";

import Header from "./components/header";
import Footer from "./components/footer";
import Hero from "./components/hero";
import About from "./components/about";
import Projects from "./components/projects";
import Skills from "./components/skills";
import Contact from "./components/contact";

export default function Home() {
  return (
    <div className="">
      {/* ヘッダー */}
      <Header />
      {/* Hero */}
      <Hero />
      {/* About */}
      <About />
      {/* Projects */}
      <Projects />
      {/* Skills */}
      <Skills />
      {/* Contact */}
      <Contact />
      {/* フッター */}
      <Footer />
    </div>
  );
}
