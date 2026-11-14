"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { MissionConfiguration, MissionDifficulty, MissionObjective } from "@/src/domain/types";
import { gameModes, getMissionTemplate, missionTemplates } from "@/src/missions/config";
import { useMissionStore } from "@/src/state/missionStore";

type MissionConfiguratorProps = { missionId: string };

const difficultyLabels: Record<MissionDifficulty, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export function MissionConfigurator({ missionId }: MissionConfiguratorProps) {
  const router = useRouter();
  const template = getMissionTemplate(missionId);
  const configuration = useMissionStore((state) => state.configuration);
  const selectedMissionId = useMissionStore((state) => state.selectedMissionId);
  const selectMission = useMissionStore((state) => state.selectMission);
  const updateConfiguration = useMissionStore((state) => state.updateConfiguration);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (template && selectedMissionId !== template.id) selectMission(template.id);
  }, [selectedMissionId, selectMission, template]);

  const activeConfiguration = useMemo(() => {
    if (!template) return null;
    if (configuration?.missionTemplateId === template.id) return configuration;
    return { missionTemplateId: template.id, name: template.title, destination: template.destination, objective: template.objective, durationDays: template.durationDays.recommended, budgetCredits: template.initialBudgetCredits, difficulty: template.difficulty } satisfies MissionConfiguration;
  }, [configuration, template]);

  if (!template || !activeConfiguration) return null;
  const missionTemplate = template;
  const missionConfiguration = activeConfiguration;

  function update<K extends keyof MissionConfiguration>(key: K, value: MissionConfiguration[K]) {
    updateConfiguration({ [key]: value });
    setErrors([]);
  }

  function handleDestinationChange(nextMissionId: string) {
    selectMission(nextMissionId);
    router.replace(`/missions/${nextMissionId}`);
  }

  function validate() {
    const nextErrors: string[] = [];
    if (!missionConfiguration.name.trim()) nextErrors.push("Mission name is required.");
    if (missionConfiguration.durationDays < missionTemplate.durationDays.min || missionConfiguration.durationDays > missionTemplate.durationDays.max) nextErrors.push(`Duration must be between ${missionTemplate.durationDays.min} and ${missionTemplate.durationDays.max} days.`);
    if (missionConfiguration.budgetCredits <= 0 || missionConfiguration.budgetCredits > missionTemplate.initialBudgetCredits) nextErrors.push(`Budget must be between 1 and ${missionTemplate.initialBudgetCredits.toLocaleString("en-US")} credits.`);
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function handleStartDesigning() {
    if (validate()) router.push(`/missions/${missionTemplate.id}/design`);
  }

  return <section className="configuration-layout">
    <div className="configuration-main">
      <div className="configuration-preview"><Image src={template.imageSrc} alt={template.imageAlt} fill sizes="(max-width: 850px) 100vw, 55vw" priority /><div className="configuration-preview-overlay" /><div className="configuration-preview-label"><span>{template.destination.toUpperCase()} / MISSION ARCHIVE</span><strong>{template.title}</strong></div></div>
      <div className="configuration-section"><div className="configuration-section-heading"><span>01</span><div><p>Mission identity</p><small>Name your mission and define the first question it will answer.</small></div></div><label className="field-label">Mission name<input value={activeConfiguration.name} onChange={(event) => update("name", event.target.value)} maxLength={50} placeholder="Enter a mission name" /></label></div>
      <div className="configuration-section"><div className="configuration-section-heading"><span>02</span><div><p>Destination</p><small>Switching destinations loads its unique constraints and operating envelope.</small></div></div><div className="destination-options">{missionTemplates.map((mission) => <button className={mission.id === template.id ? "destination-option is-active" : "destination-option"} key={mission.id} type="button" onClick={() => handleDestinationChange(mission.id)}><strong>{mission.title.replace(" Exploration", "")}</strong><span>{mission.difficulty} / {mission.durationDays.recommended} days</span></button>)}</div></div>
      <div className="configuration-section"><div className="configuration-section-heading"><span>03</span><div><p>Primary objective</p><small>Choose the outcome that will define mission success.</small></div></div><div className="objective-options">{template.objectiveOptions.map((objective) => <button className={activeConfiguration.objective === objective.id ? "objective-option is-active" : "objective-option"} key={objective.id} type="button" onClick={() => update("objective", objective.id as MissionObjective)}><strong>{objective.label}</strong><span>{objective.description}</span></button>)}</div></div>
    </div>
    <aside className="configuration-sidebar"><div className="briefing-stamp">MISSION CONFIGURATION <span>02 / 04</span></div><h2>Shape the <span>mission.</span></h2><p className="configuration-lede">Set the boundaries before you build the machine.</p><label className="field-label">Mission duration <output>{activeConfiguration.durationDays} days</output><input type="range" min={template.durationDays.min} max={template.durationDays.max} value={activeConfiguration.durationDays} onChange={(event) => update("durationDays", Number(event.target.value))} /></label><label className="field-label">Mission budget <output>{activeConfiguration.budgetCredits.toLocaleString("en-US")} cr</output><input type="range" min="1000" max={template.initialBudgetCredits} step="1000" value={activeConfiguration.budgetCredits} onChange={(event) => update("budgetCredits", Number(event.target.value))} /></label><div className="field-label">Game mode<div className="mode-options">{gameModes.map((mode) => <button className={activeConfiguration.difficulty === mode.id ? "mode-option is-active" : "mode-option"} type="button" key={mode.id} onClick={() => update("difficulty", mode.id)}><strong>{difficultyLabels[mode.id]}</strong><span>{mode.description}</span></button>)}</div></div><div className="configuration-summary"><span>Mission envelope</span><p><b>{template.maxMassKg.toLocaleString("en-US")} kg</b> max spacecraft mass</p><p><b>{template.constraints.length}</b> active constraints</p></div>{errors.length > 0 && <div className="validation-errors" role="alert">{errors.map((error) => <p key={error}>! {error}</p>)}</div>}<button className="button-primary design-button" type="button" onClick={handleStartDesigning}>Start designing <span className="button-arrow">↗</span></button></aside>
  </section>;
}
