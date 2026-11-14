"use client";

import { useRouter } from "next/navigation";
import { MissionCard } from "@/components/missions/MissionCard";
import { useMissionStore } from "@/src/state/missionStore";
import { missionTemplates } from "@/src/missions/config";

export function MissionSelection() {
  const router = useRouter();
  const selectedMissionId = useMissionStore((state) => state.selectedMissionId);
  const selectMission = useMissionStore((state) => state.selectMission);

  function handleSelect(missionId: string) {
    selectMission(missionId);
    router.push(`/missions/${missionId}`);
  }

  return <div className="mission-grid">{missionTemplates.map((mission) => <MissionCard key={mission.id} mission={mission} selected={selectedMissionId === mission.id} onSelect={() => handleSelect(mission.id)} />)}</div>;
}
