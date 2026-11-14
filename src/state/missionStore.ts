"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ComponentId, EngineeringReport, MissionConfiguration, MissionDecision, MissionDifficulty, MissionObjective } from "@/src/domain/types";
import { getMissionTemplate } from "@/src/missions/config";
import { getComponentDefinition } from "@/src/components/registry";

type MissionStore = {
  selectedMissionId: string | null;
  configuration: MissionConfiguration | null;
  selectedComponents: Partial<Record<ComponentId, number>>;
  engineeringReport: EngineeringReport | null;
  simulationStage: number;
  simulationDecisions: MissionDecision[];
  selectMission: (missionId: string) => void;
  updateConfiguration: (updates: Partial<MissionConfiguration>) => void;
  addComponent: (componentId: ComponentId) => boolean;
  removeComponent: (componentId: ComponentId) => void;
  resetComponents: () => void;
  resetConfiguration: () => void;
  saveEngineeringReport: (report: EngineeringReport) => void;
  setSimulationStage: (stage: number) => void;
  addSimulationDecision: (decision: MissionDecision) => void;
  resetSimulation: () => void;
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
      selectedComponents: {},
      engineeringReport: null,
      simulationStage: 0,
      simulationDecisions: [],
      selectMission: (missionId) => {
        const configuration = createConfiguration(missionId);
        if (!configuration) return;
        set((state) => state.selectedMissionId === missionId && state.configuration ? state : { selectedMissionId: missionId, configuration, selectedComponents: {}, engineeringReport: null, simulationStage: 0, simulationDecisions: [] });
      },
      updateConfiguration: (updates) => set((state) => ({ configuration: state.configuration ? { ...state.configuration, ...updates } : null })),
      addComponent: (componentId) => {
        const component = getComponentDefinition(componentId);
        if (!component || !component.availability.available) return false;

        let added = false;
        set((state) => {
          const currentCount = state.selectedComponents[componentId] ?? 0;
          if (currentCount >= component.availability.inventoryLimit) return state;
          added = true;
          return { selectedComponents: { ...state.selectedComponents, [componentId]: currentCount + 1 } };
        });
        return added;
      },
      removeComponent: (componentId) => set((state) => {
        const currentCount = state.selectedComponents[componentId] ?? 0;
        if (currentCount <= 1) {
          const { [componentId]: _removed, ...remaining } = state.selectedComponents;
          return { selectedComponents: remaining };
        }
        return { selectedComponents: { ...state.selectedComponents, [componentId]: currentCount - 1 } };
      }),
      resetComponents: () => set({ selectedComponents: {} }),
      resetConfiguration: () => set((state) => ({ configuration: state.selectedMissionId ? createConfiguration(state.selectedMissionId) : null })),
      saveEngineeringReport: (report) => set({ engineeringReport: report }),
      setSimulationStage: (stage) => set({ simulationStage: stage }),
      addSimulationDecision: (decision) => set((state) => ({ simulationDecisions: [...state.simulationDecisions, decision] })),
      resetSimulation: () => set({ simulationStage: 0, simulationDecisions: [] }),
    }),
    { name: "cosmic-labs-mission" },
  ),
);

export type MissionConfigurationUpdate = Partial<Pick<MissionConfiguration, "name" | "objective" | "durationDays" | "budgetCredits" | "difficulty">> & {
  objective?: MissionObjective;
  difficulty?: MissionDifficulty;
};
