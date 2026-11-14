import { notFound } from "next/navigation";
import { ResultsScreen } from "@/components/results/ResultsScreen";
import { getMissionTemplate, missionTemplates } from "@/src/missions/config";

export function generateStaticParams() { return missionTemplates.map((mission) => ({ missionId: mission.id })); }
export default async function ResultsPage({ params }: { params: Promise<{ missionId: string }> }) { const { missionId } = await params; if (!getMissionTemplate(missionId)) notFound(); return <ResultsScreen missionId={missionId} />; }
