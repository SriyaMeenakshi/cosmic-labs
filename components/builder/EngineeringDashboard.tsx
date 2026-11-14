"use client";

import { useMemo } from "react";
import { componentRegistry } from "@/src/components/registry";
import { evaluateDesign } from "@/src/engineering/evaluate";
import { useMissionStore } from "@/src/state/missionStore";

export function EngineeringDashboard() {
  const configuration = useMissionStore((state) => state.configuration);
  const selectedComponents = useMissionStore((state) => state.selectedComponents);
  const report = useMemo(() => configuration ? evaluateDesign(configuration, selectedComponents, componentRegistry) : null, [configuration, selectedComponents]);
  if (!report) return null;
  return <section className="engineering-dashboard" aria-label="Live engineering dashboard"><div className="engineering-score"><span>READINESS</span><strong>{report.score}%</strong><small>{report.status.replace("-", " ")}</small></div><div className="engineering-metrics"><div><span>MASS</span><strong>{report.totalMassKg} kg</strong><small>/ {report.massCapacityKg} kg</small></div><div><span>POWER MARGIN</span><strong className={report.powerMarginW >= 0 ? "metric-good" : "metric-danger"}>{report.powerMarginW > 0 ? "+" : ""}{report.powerMarginW} W</strong><small>{report.powerGenerationW} W gen</small></div><div><span>BATTERY</span><strong>{report.batteryCapacityWh} Wh</strong><small>reserve capacity</small></div><div><span>COST</span><strong>{report.totalCostCredits.toLocaleString("en-US")} cr</strong><small>/ {report.budgetCredits.toLocaleString("en-US")} cr</small></div></div><div className="engineering-checks">{report.checks.map((check) => <div className={`engineering-check check-${check.status}`} key={check.id}><span className="check-dot" /><div><strong>{check.label}</strong><small>{check.value}</small></div></div>)}</div></section>;
}
