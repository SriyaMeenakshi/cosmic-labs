import { notFound } from "next/navigation";
import { EvaluationScreen } from "@/components/engineering/EvaluationScreen";
import { getMissionTemplate, missionTemplates } from "@/src/missions/config";

export function generateStaticParams() { return missionTemplates.map((mission) => ({ missionId: mission.id })); }

export default async function EvaluationPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  if (!getMissionTemplate(missionId)) notFound();
  return <EvaluationScreen missionId={missionId} />;
}
