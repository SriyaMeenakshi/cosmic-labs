import Link from "next/link";
import { notFound } from "next/navigation";
import { MissionConfigurator } from "@/components/missions/MissionConfigurator";
import { getMissionTemplate, missionTemplates } from "@/src/missions/config";

export function generateStaticParams() {
  return missionTemplates.map((mission) => ({ missionId: mission.id }));
}

export default async function MissionBriefing({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  if (!getMissionTemplate(missionId)) notFound();

  return <main className="subpage"><div className="shell subpage-inner"><Link className="back-link" href="/missions">← Back to mission archive</Link><MissionConfigurator missionId={missionId} /></div></main>;
}
