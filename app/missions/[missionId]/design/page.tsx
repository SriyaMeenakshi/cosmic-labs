import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignBay } from "@/components/components/DesignBay";
import { getMissionTemplate, missionTemplates } from "@/src/missions/config";

export function generateStaticParams() {
  return missionTemplates.map((mission) => ({ missionId: mission.id }));
}

export default async function DesignBayPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const mission = getMissionTemplate(missionId);
  if (!mission) notFound();

  return <main className="subpage design-bay-page"><div className="shell subpage-inner"><Link className="back-link" href={`/missions/${mission.id}`}>← Back to mission configuration</Link><DesignBay defaultName={mission.title} /></div></main>;
}
