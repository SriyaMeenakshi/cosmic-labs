"use client";

import Link from "next/link";
import { useMemo } from "react";
import { componentRegistry } from "@/src/components/registry";
import { getMissionTemplate } from "@/src/missions/config";
import { useMissionStore } from "@/src/state/missionStore";

export function ResultsScreen({ missionId }: { missionId: string }) {
  const configuration = useMissionStore((state) => state.configuration);
  const selectedComponents = useMissionStore((state) => state.selectedComponents);
  const report = useMissionStore((state) => state.engineeringReport);
  const decisions = useMissionStore((state) => state.simulationDecisions);
  const mission = getMissionTemplate(missionId);
  const componentSummary = useMemo(() => componentRegistry.filter((item) => (selectedComponents[item.id] ?? 0) > 0).map((item) => `${item.name} × ${selectedComponents[item.id]}`), [selectedComponents]);
  if (!mission || !configuration || !report) return <main className="subpage results-page"><div className="shell subpage-inner"><p className="section-eyebrow">Debrief unavailable</p><h1>Complete a mission run first.</h1><Link className="button-primary" href={`/missions/${missionId}/design`}>Return to design bay</Link></div></main>;
  const decisionBonus = Math.min(10, decisions.length * 5);
  const finalScore = Math.min(100, Math.max(0, report.score + decisionBonus));
  return <main className="subpage results-page"><div className="shell subpage-inner"><p className="section-eyebrow">Phase 8 / mission debrief</p><div className="report-header"><div><h1>Mission <span>debrief.</span></h1><p className="library-lede">{configuration.name} / {mission.title} / Educational simulation outcome</p></div><div className="report-score"><strong>{finalScore}%</strong><span>final performance</span></div></div><div className="evaluation-layout"><div><div className="report-check-grid"><article className="report-check-card check-ready"><div><strong>Objective</strong><em>complete</em></div><p>{configuration.objective.replaceAll("-", " ")}</p><p>The mission reached its objective stage with the configured engineering checks recorded.</p></article><article className="report-check-card check-ready"><div><strong>Resources</strong><em>tracked</em></div><p>{report.totalMassKg} kg / {report.powerMarginW} W margin</p><p>Resource utilization is calculated from the selected educational component registry.</p></article><article className="report-check-card check-warning"><div><strong>Decisions</strong><em>{decisions.length} recorded</em></div><p>Decision-making bonus: +{decisionBonus} points</p><p>Choices affect this debrief score in a simplified, transparent model.</p></article><article className="report-check-card check-ready"><div><strong>Configuration</strong><em>{componentSummary.length} modules</em></div><p>{componentSummary.join(" · ") || "No modules"}</p><p>Try a new configuration and compare how the engineering envelope changes.</p></article></div><div className="report-actions"><Link className="button-secondary" href={`/missions/${missionId}/design`}>Modify spacecraft</Link><Link className="button-primary" href="/missions">Start new mission ↗</Link></div></div><aside className="report-side"><p className="section-eyebrow">Learning notes</p><h2>Why this result?</h2><ul><li>Readiness is based on mass, power, battery, communications, propulsion, structure, and budget checks.</li><li>Power margin is instantaneous watts; battery capacity is stored watt-hours.</li><li>All component specifications are illustrative educational game values, not NASA hardware specifications.</li></ul></aside></div></div></main>;
}
