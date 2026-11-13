import Link from "next/link";
import { ActionButton } from "@/components/ui/ActionButton";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

const missions = [
  { id: "M-01", title: "Red Horizon", destination: "Mars", description: "Design a resilient observation mission for the long way out.", accent: "mars" },
  { id: "L-02", title: "Lunar Relay", destination: "Moon", description: "Build a compact communications platform for the lunar south pole.", accent: "moon" },
  { id: "A-07", title: "Drift Harvest", destination: "Asteroids", description: "Balance a prospecting mission against a changing orbital window.", accent: "asteroid" },
];

export default function MissionsPage() {
  return <main className="subpage"><div className="shell subpage-inner"><Link className="back-link" href="/">← Return to mission control</Link><SectionEyebrow>Mission selection / archive 01</SectionEyebrow><h1>Choose your <span>unknown.</span></h1><p className="subpage-lede">Select a destination and start with a real engineering question. Your spacecraft is waiting.</p><div className="mission-grid" id="destinations">{missions.map((mission) => <article className={`mission-card mission-card-${mission.accent}`} key={mission.id}><div className="mission-card-top"><span>{mission.id}</span><span>BRIEFING READY</span></div><div className="mission-icon" /><h2>{mission.title}</h2><p>{mission.destination} / {mission.description}</p><ActionButton href={`/missions/${mission.id.toLowerCase()}`}>Start mission</ActionButton></article>)}</div></div></main>;
}
