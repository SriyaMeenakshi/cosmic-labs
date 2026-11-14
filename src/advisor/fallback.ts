import type { EngineeringReport, MissionConfiguration } from "@/src/domain/types";

export function answerMissionQuestion(question: string, configuration: MissionConfiguration, report: EngineeringReport) {
  const text = question.toLowerCase();
  if (text.includes("power") || report.powerMarginW < 0) return report.powerMarginW < 0
    ? `Your power margin is ${report.powerMarginW} W because listed consumption exceeds generation. Add solar panels or reduce powered instruments. This is an educational calculation, not a flight certification.`
    : `Your current power margin is +${report.powerMarginW} W. That is instantaneous power balance; battery capacity is stored energy measured in Wh.`;
  if (text.includes("mass") || report.totalMassKg > report.massCapacityKg) return `The design mass is ${report.totalMassKg} kg against a ${report.massCapacityKg} kg mission envelope. Remove lower-priority modules or choose a lighter architecture.`;
  if (text.includes("battery") || text.includes("energy")) return report.batteryCapacityWh ? `The design has ${report.batteryCapacityWh} Wh of educational reserve capacity. A battery stores energy; it is not the same quantity as power in watts.` : "No battery is installed. Add a rechargeable battery before planning eclipse or night-side operations.";
  if (text.includes("communicat") || report.missingComponents.includes("Communications")) return "The simplified communications check expects both a high-gain antenna and a communication transceiver. Together they represent a complete educational link subsystem.";
  if (text.includes("improve") || text.includes("suggest")) return report.suggestions[0] ?? "Your current design has no immediate suggestions. Compare a lighter or lower-power configuration to explore trade-offs.";
  return `${configuration.name} currently scores ${report.score}% readiness. Ask about mass, power, battery, communications, or improvements for a focused explanation.`;
}
