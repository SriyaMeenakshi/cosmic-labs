import type { ComponentId, Spacecraft, SpacecraftComponent, Vector3 } from "@/src/domain/types";
import { componentRegistry } from "@/src/components/registry";

const slots: Record<string, Vector3[]> = {
  structure: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0.9, z: 0 }, { x: 0, y: -0.9, z: 0 }],
  power: [{ x: 1.5, y: 0, z: 0 }, { x: -1.5, y: 0, z: 0 }, { x: 0, y: 0, z: 1.5 }],
  communication: [{ x: 0, y: 1.35, z: 0 }, { x: 0, y: 1.7, z: 0 }],
  science: [{ x: 0, y: 0, z: 1.35 }, { x: 0, y: 0, z: -1.35 }, { x: 0.8, y: 0.4, z: 0 }],
  propulsion: [{ x: 0, y: -1.45, z: 0 }, { x: 0.8, y: -1.45, z: 0 }, { x: -0.8, y: -1.45, z: 0 }, { x: 0, y: -1.8, z: 0 }],
};

export function buildSpacecraft(counts: Partial<Record<ComponentId, number>>): Spacecraft {
  const components: SpacecraftComponent[] = [];
  const usedSlots: Record<string, number> = {};
  componentRegistry.forEach((definition) => {
    const count = counts[definition.id] ?? 0;
    for (let index = 0; index < count; index += 1) {
      const categorySlots = slots[definition.category] ?? [{ x: 0, y: 0, z: 0 }];
      const slotIndex = usedSlots[definition.category] ?? 0;
      usedSlots[definition.category] = slotIndex + 1;
      components.push({ instanceId: `${definition.id}-${index + 1}`, definitionId: definition.id, position: categorySlots[slotIndex % categorySlots.length], rotation: { x: 0, y: 0, z: 0 }, enabled: true });
    }
  });
  const totalMassKg = components.reduce((sum, item) => sum + (componentRegistry.find((definition) => definition.id === item.definitionId)?.massKg ?? 0), 0);
  const totalCostCredits = components.reduce((sum, item) => sum + (componentRegistry.find((definition) => definition.id === item.definitionId)?.costCredits ?? 0), 0);
  const totalPowerGenerationW = components.reduce((sum, item) => sum + (componentRegistry.find((definition) => definition.id === item.definitionId)?.power.mode === "generation" ? componentRegistry.find((definition) => definition.id === item.definitionId)?.power.watts ?? 0 : 0), 0);
  const totalPowerConsumptionW = components.reduce((sum, item) => sum + (componentRegistry.find((definition) => definition.id === item.definitionId)?.power.mode === "consumption" ? componentRegistry.find((definition) => definition.id === item.definitionId)?.power.watts ?? 0 : 0), 0);
  return { id: "current-spacecraft" as Spacecraft["id"], name: "Current design", components, totalMassKg, totalVolumeM3: 0, totalPowerGenerationW, totalPowerConsumptionW, totalCostCredits, centerOfMass: { x: 0, y: 0, z: 0 }, designVersion: 1 };
}
