import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/ui/ActionButton";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

const missionBriefings: Record<string, { code: string; title: string; destination: string; description: string; accent: string }> = {
  "m-01": { code: "M-01", title: "Red Horizon", destination: "Mars", description: "Design a resilient observation mission for the long way out.", accent: "mars" },
  "l-02": { code: "L-02", title: "Lunar Relay", destination: "Moon", description: "Build a compact communications platform for the lunar south pole.", accent: "moon" },
  "a-07": { code: "A-07", title: "Drift Harvest", destination: "Asteroids", description: "Balance a prospecting mission against a changing orbital window.", accent: "asteroid" },
};

export default async function MissionBriefing({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const mission = missionBriefings[missionId.toLowerCase()];
  if (!mission) notFound();

  return <main className="subpage"><div className="shell subpage-inner briefing-page"><Link className="back-link" href="/missions">← Back to mission archive</Link><SectionEyebrow>Mission briefing / {mission.code}</SectionEyebrow><h1>{mission.title}<br /><span>{mission.destination}</span></h1><p className="subpage-lede">{mission.description}</p><div className={`briefing-panel briefing-${mission.accent}`}><div className="briefing-panel-icon" /><div><span className="destination-code">BRIEFING READY</span><h2>Mission builder coming online</h2><p>The Phase 1 landing experience is ready. Spacecraft assembly and mission simulation will be activated in the next implementation phase.</p><ActionButton href="/missions" variant="secondary">Choose another mission</ActionButton></div></div></div></main>;
}
