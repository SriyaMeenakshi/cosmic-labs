"use client";

import { ComponentLibrary } from "@/components/components/ComponentLibrary";
import { EngineeringDashboard } from "@/components/builder/EngineeringDashboard";
import { SpacecraftCanvas } from "@/components/builder/SpacecraftCanvas";
import { GestureControlPanel } from "@/components/gestures/GestureControlPanel";
import { useMissionStore } from "@/src/state/missionStore";

type DesignBayProps = { defaultName: string; missionId: string };

export function DesignBay({ defaultName, missionId }: DesignBayProps) {
  const missionName = useMissionStore((state) => state.configuration?.name) ?? defaultName;
  return <><div className="builder-header"><div><p className="section-eyebrow">Phase 4 / spacecraft assembly</p><h1>Engineer the <span>vehicle.</span></h1><p>Choose modules, inspect the live spacecraft, and keep the mission envelope in view.</p></div><div className="builder-header-tag">DESIGN / 01</div></div><EngineeringDashboard /><div className="builder-workspace"><SpacecraftCanvas /><ComponentLibrary missionName={missionName} /></div><div className="builder-next-step"><p className="section-eyebrow">Phase 6 / next gate</p><h2>Ready to evaluate the design?</h2><p>Run the deterministic engineering checks before attempting the mission simulation.</p><a className="button-primary" href={`/missions/${missionId}/evaluate`}>Evaluate feasibility <span className="button-arrow">↗</span></a></div><GestureControlPanel /></>;
}
