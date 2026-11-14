import { notFound } from "next/navigation";
import { SimulationScreen } from "@/components/simulation/SimulationScreen";
import { getMissionTemplate, missionTemplates } from "@/src/missions/config";

export function generateStaticParams() { return missionTemplates.map((mission) => ({ missionId: mission.id })); }
export default async function SimulationPage({ params }: { params: Promise<{ missionId: string }> }) { const { missionId } = await params; if (!getMissionTemplate(missionId)) notFound(); return <SimulationScreen missionId={missionId} />; }
