"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MissionConfiguration, MissionDifficulty, MissionObjective } from "@/src/domain/types";
import { getMissionTemplate } from "@/src/missions/config";

type MissionStore = {
  selectedMissionId: string | null;
  configuration: MissionConfiguration | null;
  selectMission: (missionId: string) => void;
  updateConfiguration: (updates: Partial<MissionConfiguration>) => void;
  resetConfiguration: () => void;
};

function createConfiguration(missionId: string): MissionConfiguration | null {
  const template = getMissionTemplate(missionId);
  if (!template) return null;

  return {
    missionTemplateId: template.id,
    name: template.title,
    destination: template.destination,
    objective: template.objective,
    durationDays: template.durationDays.recommended,
    budgetCredits: template.initialBudgetCredits,
    difficulty: template.difficulty,
  };
}

export const useMissionStore = create<MissionStore>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      configuration: null,
      selectMission: (missionId) => {
        const configuration = createConfiguration(missionId);
        if (!configuration) return;
        set({ selectedMissionId: missionId, configuration });
      },
      updateConfiguration: (updates) => set((state) => ({ configuration: state.configuration ? { ...state.configuration, ...updates } : null })),
      resetConfiguration: () => set((state) => ({ configuration: state.selectedMissionId ? createConfiguration(state.selectedMissionId) : null })),
    }),
    { name: "cosmic-labs-mission" },
  ),
);

export type MissionConfigurationUpdate = Partial<Pick<MissionConfiguration, "name" | "objective" | "durationDays" | "budgetCredits" | "difficulty">> & {
  objective?: MissionObjective;
  difficulty?: MissionDifficulty;
};
