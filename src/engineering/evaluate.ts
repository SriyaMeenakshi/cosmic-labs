import type {
  ComponentDefinition,
  EngineeringCheck,
  EngineeringReport,
  MissionConfiguration,
} from "@/src/domain/types";
import { getMissionTemplate } from "@/src/missions/config";

type ComponentCounts = Partial<Record<string, number>>;

function countOf(counts: ComponentCounts, id: string) {
  return counts[id] ?? 0;
}

function statusFor(ok: boolean, warning = false): EngineeringCheck["status"] {
  return ok ? "ready" : warning ? "warning" : "not-ready";
}

export function evaluateDesign(
  configuration: MissionConfiguration,
  counts: ComponentCounts,
  registry: readonly ComponentDefinition[],
): EngineeringReport {
  const mission = getMissionTemplate(configuration.missionTemplateId);
  const mass = registry.reduce((sum, item) => sum + item.massKg * countOf(counts, item.id), 0);
  const cost = registry.reduce((sum, item) => sum + item.costCredits * countOf(counts, item.id), 0);
  const generation = registry.reduce((sum, item) => sum + (item.power.mode === "generation" ? item.power.watts * countOf(counts, item.id) : 0), 0);
  const consumption = registry.reduce((sum, item) => sum + (item.power.mode === "consumption" ? item.power.watts * countOf(counts, item.id) : 0), 0);
  const batteryCapacity = registry.reduce((sum, item) => sum + Number(item.properties.capacityWh ?? 0) * countOf(counts, item.id), 0);
  const maxMass = mission?.maxMassKg ?? 0;
  const budget = configuration.budgetCredits;
  const powerMargin = generation - consumption;
  const has = (id: string) => countOf(counts, id) > 0;
  const propulsionRequired = configuration.destination !== "moon";
  const checks: EngineeringCheck[] = [
    { id: "structure", label: "Structure", status: statusFor(has("structure-main-bus")), value: has("structure-main-bus") ? "Bus installed" : "Missing", explanation: "Every educational design needs a central spacecraft bus." },
    { id: "mass", label: "Mass envelope", status: statusFor(mass <= maxMass, mass <= maxMass * 1.1), value: `${mass.toLocaleString("en-US")} kg`, limit: `${maxMass.toLocaleString("en-US")} kg`, explanation: mass <= maxMass ? "The design fits within the mission launch-mass envelope." : "Remove mass or select a lighter configuration." },
    { id: "power", label: "Power margin", status: statusFor(powerMargin >= 0, powerMargin >= -50), value: `${powerMargin >= 0 ? "+" : ""}${powerMargin} W`, limit: "0 W minimum", explanation: powerMargin >= 0 ? "Generation covers the listed active subsystem load." : "Add generation or remove power-consuming systems." },
    { id: "battery", label: "Battery reserve", status: statusFor(batteryCapacity > 0, false), value: `${batteryCapacity.toLocaleString("en-US")} Wh`, explanation: batteryCapacity > 0 ? "A reserve is available for eclipse or night-side operations." : "Add at least one battery for reserve-energy planning." },
    { id: "communication", label: "Communications", status: statusFor(has("communication-high-gain-antenna") && has("communication-transceiver")), value: has("communication-high-gain-antenna") && has("communication-transceiver") ? "Link ready" : "Incomplete", explanation: "The simplified check requires both an antenna and a transceiver." },
    { id: "propulsion", label: "Propulsion", status: statusFor(!propulsionRequired || (has("propulsion-engine") && has("propulsion-fuel-tank")), propulsionRequired), value: !propulsionRequired ? "Optional" : has("propulsion-engine") && has("propulsion-fuel-tank") ? "Maneuver set" : "Incomplete", explanation: propulsionRequired ? "This destination uses a simplified maneuver requirement." : "Lunar designs may use propulsion as an optional educational module." },
    { id: "budget", label: "Budget", status: statusFor(cost <= budget, cost <= budget * 1.1), value: `${cost.toLocaleString("en-US")} cr`, limit: `${budget.toLocaleString("en-US")} cr`, explanation: cost <= budget ? "The component estimate fits the configured mission budget." : "Remove components or increase the mission budget." },
  ];
  const missingComponents = checks.filter((check) => check.status === "not-ready").map((check) => check.label);
  const warnings = checks.filter((check) => check.status !== "ready").map((check) => check.explanation);
  const suggestions = [
    !has("power-solar-panels") ? "Add solar panels to create a positive generation margin." : "",
    !has("power-rechargeable-battery") ? "Add a rechargeable battery to protect the mission during power interruptions." : "",
    configuration.objective === "resource-exploration" && !has("science-spectrometer") ? "A spectrometer improves the educational resource-analysis payload." : "",
  ].filter(Boolean);
  const readyChecks = checks.filter((check) => check.status === "ready").length;
  const score = Math.round((readyChecks / checks.length) * 100);
  return { score, status: missingComponents.length ? "not-ready" : warnings.length ? "warning" : "ready", totalMassKg: mass, massCapacityKg: maxMass, powerGenerationW: generation, powerConsumptionW: consumption, powerMarginW: powerMargin, batteryCapacityWh: batteryCapacity, totalCostCredits: cost, budgetCredits: budget, checks, missingComponents, warnings, suggestions };
}
