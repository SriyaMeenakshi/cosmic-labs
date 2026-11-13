/**
 * Stable domain contracts for COSMIC LABS — MISSION ARCHITECT.
 *
 * This file contains no React, Three.js, browser, MediaPipe, or API code.
 * UI and adapters should depend on these contracts; the simulation engine
 * must remain runnable without a browser.
 */

export type MissionId = string & { readonly __brand: "MissionId" };
export type SpacecraftId = string & { readonly __brand: "SpacecraftId" };
export type ComponentId = string & { readonly __brand: "ComponentId" };
export type SimulationId = string & { readonly __brand: "SimulationId" };

export type MissionStatus = "draft" | "ready" | "running" | "completed" | "failed";
export type MissionObjective = "orbit" | "landing" | "flyby" | "rendezvous" | "observation";
export type ComponentCategory = "structure" | "propulsion" | "power" | "payload" | "communication" | "thermal";
export type SimulationStatus = "idle" | "running" | "paused" | "completed" | "failed";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ResourceBudget {
  massKg: number;
  volumeM3: number;
  powerW: number;
  dataMb: number;
  budgetCredits: number;
}

export interface MissionConstraints {
  maxDurationDays: number;
  maxLaunchMassKg: number;
  requiredDeltaVKmPerS: number;
  communicationWindowPercent: number;
  requiredReliabilityPercent: number;
}

export interface MissionObjectiveDefinition {
  id: string;
  type: MissionObjective;
  title: string;
  description: string;
  completionPercent: number;
  required: boolean;
}

export interface Mission {
  id: MissionId;
  name: string;
  description: string;
  status: MissionStatus;
  objectives: MissionObjectiveDefinition[];
  constraints: MissionConstraints;
  initialResources: ResourceBudget;
  spacecraftId?: SpacecraftId;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentCapabilities {
  thrustN?: number;
  specificImpulseS?: number;
  powerGenerationW?: number;
  powerConsumptionW?: number;
  communicationRangeKm?: number;
  payloadCapacityKg?: number;
  thermalCapacityW?: number;
}

export interface ComponentDefinition {
  id: ComponentId;
  name: string;
  category: ComponentCategory;
  description: string;
  massKg: number;
  volumeM3: number;
  costCredits: number;
  capabilities: ComponentCapabilities;
  modelAsset?: string;
  connectionPoints: string[];
}

export interface SpacecraftComponent {
  instanceId: string;
  definitionId: ComponentId;
  position: Vector3;
  rotation: Vector3;
  enabled: boolean;
}

export interface Spacecraft {
  id: SpacecraftId;
  name: string;
  components: SpacecraftComponent[];
  totalMassKg: number;
  totalVolumeM3: number;
  totalPowerGenerationW: number;
  totalPowerConsumptionW: number;
  totalCostCredits: number;
  centerOfMass: Vector3;
  designVersion: number;
}

export interface EngineeringSnapshot {
  massKg: number;
  deltaVKmPerS: number;
  powerBalanceW: number;
  communicationMarginPercent: number;
  thermalMarginW: number;
  reliabilityPercent: number;
  warnings: string[];
  valid: boolean;
}

export interface SimulationClock {
  elapsedSeconds: number;
  timeScale: number;
  tick: number;
}

export interface SimulationState {
  id: SimulationId;
  missionId: MissionId;
  status: SimulationStatus;
  clock: SimulationClock;
  spacecraftPosition: Vector3;
  spacecraftVelocity: Vector3;
  fuelKg: number;
  powerRemainingWh: number;
  completedObjectiveIds: string[];
  engineering: EngineeringSnapshot;
  events: SimulationEvent[];
  failureReason?: string;
}

export interface SimulationEvent {
  id: string;
  timestampSeconds: number;
  type: "launch" | "maneuver" | "communication" | "objective" | "warning" | "failure";
  message: string;
  severity: "info" | "warning" | "error";
}

export interface SimulationInput {
  mission: Mission;
  spacecraft: Spacecraft;
  componentCatalog: ReadonlyMap<ComponentId, ComponentDefinition>;
  seed: number;
}

export interface SimulationEngine {
  initialize(input: SimulationInput): SimulationState;
  step(state: SimulationState, deltaSeconds: number): SimulationState;
  pause(state: SimulationState): SimulationState;
  resume(state: SimulationState): SimulationState;
}
