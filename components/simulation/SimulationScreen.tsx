"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMissionTemplate } from "@/src/missions/config";
import { useMissionStore } from "@/src/state/missionStore";

const stages = ["Pre-launch checks", "Countdown", "Launch sequence", "Cruise / transfer", "Mission operations", "Objective completion"];

export function SimulationScreen({ missionId }: { missionId: string }) {
  const configuration = useMissionStore((state) => state.configuration);
  const report = useMissionStore((state) => state.engineeringReport);
  const stage = useMissionStore((state) => state.simulationStage);
  const decisions = useMissionStore((state) => state.simulationDecisions);
  const setStage = useMissionStore((state) => state.setSimulationStage);
  const addDecision = useMissionStore((state) => state.addSimulationDecision);
  const resetSimulation = useMissionStore((state) => state.resetSimulation);
  const [eventResolved, setEventResolved] = useState(false);
  const mission = getMissionTemplate(missionId);
  useEffect(() => { resetSimulation(); }, [resetSimulation]);
  const currentStage = Math.min(stage, stages.length - 1);
  const eventVisible = currentStage === 4 && !eventResolved;
  const event = useMemo(() => ({ id: "power-window", label: "Reduced solar window", message: "A temporary lighting change reduces generation during operations. Choose how the crew should respond.", choices: [{ id: "low-power", label: "Enter low-power mode", consequence: "Preserves battery and pauses nonessential observations." }, { id: "continue", label: "Continue observations", consequence: "Maintains science output but uses more reserve energy." }] }), []);
  if (!mission || !configuration || !report) return <main className="subpage simulation-page"><div className="shell subpage-inner"><p className="section-eyebrow">Simulation unavailable</p><h1>Run an evaluation first.</h1><Link className="button-primary" href={`/missions/${missionId}/design`}>Return to design bay</Link></div></main>;
  const chooseEvent = (choiceId: string) => { addDecision({ eventId: event.id, choiceId, timestampSeconds: currentStage * 86400 }); setEventResolved(true); };
  return <main className="subpage simulation-page"><div className="shell subpage-inner"><Link className="back-link" href={`/missions/${missionId}/evaluate`}>← Return to feasibility report</Link><p className="section-eyebrow">Phase 7 / mission simulation</p><div className="simulation-shell"><div className="simulation-topbar"><div><h1>{configuration.name}</h1><p>{mission.title} / {mission.objective.replaceAll("-", " ")}</p></div><span className="mission-selection-status">SIMULATION ONLINE</span></div><div className="simulation-stage"><div><strong>{stages[currentStage]}</strong><p>{currentStage === 0 ? "All readiness checks have passed. The vehicle is configured for an educational mission run." : currentStage === 5 ? "The mission objective has been attempted. Review the debrief for the outcome." : "Mission control is monitoring spacecraft health, communications, and reserve energy."}</p></div></div>{eventVisible && <div className="simulation-event"><strong>Mission control event</strong><p>{event.message}</p><div className="simulation-choices">{event.choices.map((choice) => <button key={choice.id} type="button" onClick={() => chooseEvent(choice.id)}>{choice.label}</button>)}</div></div>}{eventResolved && <div className="simulation-event"><strong>Decision recorded</strong><p>{event.choices.find((choice) => choice.id === decisions.at(-1)?.choiceId)?.consequence}</p></div>}<div className="simulation-controls"><span>Stage {currentStage + 1} / {stages.length} · Power margin {report.powerMarginW} W</span>{currentStage >= stages.length - 1 ? <Link className="button-primary" href={`/missions/${missionId}/results`}>Open debrief ↗</Link> : <button className="button-primary" type="button" disabled={eventVisible} onClick={() => setStage(currentStage + 1)}>{currentStage === 0 ? "Begin countdown" : "Advance mission"} <span className="button-arrow">↗</span></button>}</div></div></div></main>;
}
