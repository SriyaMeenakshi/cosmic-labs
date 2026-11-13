"use client";

import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/ActionButton";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SpacecraftVisual } from "@/components/landing/SpacecraftVisual";
import { Starfield } from "@/components/site/Starfield";

const workflow = [
  ["01", "Design", "Set the objective. Define the unknown."],
  ["02", "Assemble", "Build a spacecraft from real constraints."],
  ["03", "Validate", "Balance mass, power, fuel, and risk."],
  ["04", "Launch", "Put your decisions to the test."],
];

const features = [
  ["01", "Interactive builder", "Compose a spacecraft in a spatial canvas where every component has a job."],
  ["02", "Gesture control", "Reach into the mission with natural hand gestures when the camera is available."],
  ["03", "Engineering validation", "See the consequences of mass, power, thermal, and communication choices."],
  ["04", "Mission simulation", "Run the mission, read the telemetry, and adapt when the unexpected happens."],
  ["05", "AI mission advisor", "Get context-aware guidance without handing your engineering decisions away."],
];

const destinations = [
  ["MARS", "M-01", "A patient journey through the red unknown.", "mars"],
  ["MOON", "L-02", "Short-range precision. No room for waste.", "moon"],
  ["ASTEROIDS", "A-07", "Find value where the orbit gets difficult.", "asteroid"],
];

export function LandingPage() {
  return (
    <main>
      <section className="hero-section">
        <Starfield />
        <div className="shell hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <SectionEyebrow>Interactive space mission design / v.01</SectionEyebrow>
            <h1>Design your own <span>space mission.</span></h1>
            <p className="hero-intro">A hands-on engineering playground for curious minds. Build the spacecraft, balance the constraints, and discover what it takes to reach beyond Earth.</p>
            <div className="hero-actions"><ActionButton href="/missions">Start building</ActionButton><ActionButton href="/missions#destinations" variant="secondary">Explore missions</ActionButton></div>
            <div className="hero-meta"><span><i className="status-dot" /> SYSTEMS ONLINE</span><span>NASA SPACE APPS / 2025</span></div>
          </motion.div>
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15 }}><SpacecraftVisual /></motion.div>
        </div>
        <div className="hero-scroll">Scroll to explore <span>↓</span></div>
      </section>

      <section className="section section-dark" id="how-it-works">
        <div className="shell">
          <div className="section-heading split-heading"><div><SectionEyebrow>The mission loop</SectionEyebrow><h2>Ideas become <span>trajectories.</span></h2></div><p>Every mission starts with a question. The engineering is how you learn to ask better ones.</p></div>
          <div className="workflow-grid">{workflow.map(([number, title, text]) => <motion.article whileHover={{ y: -5 }} className="workflow-card" key={number}><span className="card-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="card-arrow">↗</span></motion.article>)}</div>
        </div>
      </section>

      <section className="section feature-section">
        <div className="shell"><div className="section-heading"><SectionEyebrow>Inside mission control</SectionEyebrow><h2>Build with <span>intention.</span></h2></div><div className="feature-list">{features.map(([number, title, text]) => <article className="feature-row" key={number}><span className="feature-number">{number}</span><h3>{title}</h3><p>{text}</p><span className="feature-arrow">↗</span></article>)}</div></div>
      </section>

      <section className="section destination-section" id="destinations">
        <div className="shell"><div className="section-heading split-heading"><div><SectionEyebrow>Choose your unknown</SectionEyebrow><h2>Where will you <span>go?</span></h2></div><ActionButton href="/missions" variant="quiet">View all missions</ActionButton></div><div className="destination-grid">{destinations.map(([name, code, text, style]) => <motion.div whileHover={{ y: -7 }} className={`destination-card destination-${style}`} key={name}><div className="destination-planet" /><span className="destination-code">{code}</span><div><h3>{name}</h3><p>{text}</p></div><span className="card-arrow">↗</span></motion.div>)}</div></div>
      </section>

      <section className="about-strip"><div className="shell about-grid"><div><SectionEyebrow>Why COSMIC LABS</SectionEyebrow><h2>Curiosity is a <span>navigation system.</span></h2></div><div><p>Mission Architect turns space science into an open-ended engineering challenge. It is built for the NASA Space Apps Challenge community: a place to learn by making, testing, and sharing the missions you imagine.</p><ActionButton href="/about" variant="secondary">About the project</ActionButton></div></div></section>

      <footer className="site-footer"><div className="shell footer-grid"><div className="brand footer-brand"><span className="brand-mark" aria-hidden="true"><span /></span><span><strong>COSMIC</strong><small>LABS / MISSION ARCHITECT</small></span></div><p>Build. Engineer. Launch. Discover.</p><span>© 2025 COSMIC LABS</span></div></footer>
    </main>
  );
}
