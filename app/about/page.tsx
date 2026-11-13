import Link from "next/link";
import { ActionButton } from "@/components/ui/ActionButton";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export default function AboutPage() {
  return <main className="subpage"><div className="shell subpage-inner about-page"><Link className="back-link" href="/">← Return to mission control</Link><SectionEyebrow>About the project</SectionEyebrow><h1>Make space for <span>curiosity.</span></h1><div className="about-copy"><p className="subpage-lede">COSMIC LABS — Mission Architect is an educational space mission design game created for the NASA Space Apps Challenge and its official Space Mission Design Game challenge.</p><p>It gives learners a way to explore systems thinking through play: every choice has a mass, a cost, a power draw, and a consequence. The goal is not to memorize a perfect answer. It is to build a mission, test a hypothesis, and learn from the result.</p><p>Mission Architect is designed as a collaborative starting point for students, engineers, artists, and space enthusiasts who want to understand the trade-offs behind exploration.</p><ActionButton href="/missions">Explore missions</ActionButton></div></div></main>;
}
