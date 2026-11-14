"use client";

import Image from "next/image";
import type { MissionTemplate } from "@/src/domain/types";
import { objectiveOptions } from "@/src/missions/config";

type MissionCardProps = {
  mission: MissionTemplate;
  selected: boolean;
  onSelect: (mission: MissionTemplate) => void;
};

const difficultyLabels = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

export function MissionCard({ mission, selected, onSelect }: MissionCardProps) {
  const objective = objectiveOptions.find((option) => option.id === mission.objective);

  return (
    <article className={`mission-card mission-card-${mission.destination} ${selected ? "mission-card-selected" : ""}`}>
      <button className="mission-card-hit-area" type="button" onClick={() => onSelect(mission)} aria-pressed={selected} aria-label={`Select ${mission.title}`}>
        <Image className="mission-card-image" src={mission.imageSrc} alt={mission.imageAlt} fill sizes="(max-width: 850px) 100vw, 33vw" />
        <span className="mission-image-scrim" />
        <span className="mission-card-top"><span>{mission.destination.toUpperCase()}</span><span>{mission.id.slice(0, 3).toUpperCase()} / BRIEFING</span></span>
        <span className="mission-card-copy"><span className="mission-selection-status">{selected ? "SELECTED" : "SELECT DESTINATION"}</span><strong>{mission.title}</strong><span>{mission.description}</span></span>
      </button>
      <div className="mission-card-details">
        <div className="mission-detail"><span>Objective</span><strong>{objective?.label}</strong></div>
        <div className="mission-detail"><span>Difficulty</span><strong>{difficultyLabels[mission.difficulty]}</strong></div>
        <div className="mission-detail"><span>Duration</span><strong>{mission.durationDays.recommended} days</strong></div>
        <div className="mission-detail"><span>Initial budget</span><strong>{mission.initialBudgetCredits.toLocaleString("en-US")} cr</strong></div>
        <div className="mission-detail"><span>Max mass</span><strong>{mission.maxMassKg.toLocaleString("en-US")} kg</strong></div>
      </div>
      <div className="mission-constraints"><span>Constraints</span>{mission.constraints.map((constraint) => <em key={constraint}>{constraint}</em>)}</div>
    </article>
  );
}
