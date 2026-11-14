"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { componentRegistry } from "@/src/components/registry";
import { evaluateDesign } from "@/src/engineering/evaluate";
import { getMissionTemplate } from "@/src/missions/config";
import { useMissionStore } from "@/src/state/missionStore";
import { AdvisorPanel } from "@/components/advisor/AdvisorPanel";

export function EvaluationScreen({ missionId }: { missionId: string }) {
  const configuration = useMissionStore((state) => state.configuration);
  const selectedComponents = useMissionStore((state) => state.selectedComponents);
  const selectMission = useMissionStore((state) => state.selectMission);
  const saveReport = useMissionStore((state) => state.saveEngineeringReport);
  const mission = getMissionTemplate(missionId);
  useEffect(() => { if (!configuration || configuration.missionTemplateId !== missionId) selectMission(missionId); }, [configuration, missionId, selectMission]);
  const report = useMemo(() => configuration ? evaluateDesign(configuration, selectedComponents, componentRegistry) : null, [configuration, selectedComponents]);
  if (!mission || !configuration || !report) return <div className="loading-screen"><span className="loading-orbit" /> Preparing engineering model...</div>;
  const handleReport = () => saveReport(report);
  return <main className="subpage evaluation-page"><div className="shell subpage-inner"><Link className="back-link" href={`/missions/${missionId}/design`}>← Return to design bay</Link><div className="report-header"><div><p className="section-eyebrow">Phase 6 / deterministic feasibility engine</p><h1>Check the <span>envelope.</span></h1></div><div className="report-score"><strong>{report.score}%</strong><span>mission readiness</span></div></div><div className="evaluation-layout"><div><div className="report-check-grid">{report.checks.map((check) => <article className={`report-check-card check-${check.status}`} key={check.id}><div><strong>{check.label}</strong><em>{check.status.replace("-", " ")}</em></div><p>{check.value}{check.limit ? ` / ${check.limit}` : ""}</p><p>{check.explanation}</p></article>)}</div><div className="report-actions"><Link className="button-secondary" href={`/missions/${missionId}/design`}>Modify design</Link>{report.status === "not-ready" ? <button className="button-primary" type="button" disabled>Resolve checks to launch</button> : <Link className="button-primary" href={`/missions/${missionId}/simulation`} onClick={handleReport}>Launch simulation <span className="button-arrow">↗</span></Link>}</div></div><aside className="report-side"><p className="section-eyebrow">Engineering readout</p><h2>Transparent rules</h2><p className="detail-description">Mass, power, battery, communications, propulsion, structure, and budget are evaluated deterministically.</p><ul>{(report.suggestions.length ? report.suggestions : ["The current design has no immediate improvement suggestions."]).map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul></aside></div><AdvisorPanel configuration={configuration} report={report} /></div></main>;
}
