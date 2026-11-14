import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/ui/ActionButton";
import { getMissionTemplate, missionTemplates } from "@/src/missions/config";

export function generateStaticParams() {
  return missionTemplates.map((mission) => ({ missionId: mission.id }));
}

export default async function DesignBayPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const mission = getMissionTemplate(missionId);
  if (!mission) notFound();

  return <main className="subpage"><div className="shell subpage-inner briefing-page"><Link className="back-link" href={`/missions/${mission.id}`}>← Back to mission configuration</Link><p className="section-eyebrow">Design bay / phase 02</p><h1>Mission envelope <span>secured.</span></h1><div className="briefing-panel"><div className="briefing-panel-icon" /><div><span className="destination-code">{mission.title.toUpperCase()} / {mission.destination.toUpperCase()}</span><h2>Spacecraft assembly is next.</h2><p>Your configuration has been preserved. The spacecraft builder will be activated in the next phase; no assembly state is created yet.</p><ActionButton href={`/missions/${mission.id}`} variant="secondary">Edit configuration</ActionButton></div></div></div></main>;
}
