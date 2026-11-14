"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import { componentRegistry } from "@/src/components/registry";
import { useMissionStore } from "@/src/state/missionStore";
import { buildSpacecraft } from "@/src/spacecraft/buildModel";

function Module({ componentId, position, selected, onSelect }: { componentId: string; position: [number, number, number]; selected: boolean; onSelect: () => void }) {
  const definition = componentRegistry.find((item) => item.id === componentId);
  if (!definition) return null;
  const color = definition.category === "power" ? "#ffb547" : definition.category === "communication" ? "#8865ff" : definition.category === "propulsion" ? "#ff5364" : definition.category === "science" ? "#f4f7ff" : "#35d6ff";
  const scale = definition.category === "power" ? [0.95, 0.08, 0.42] : definition.category === "communication" ? [0.5, 0.08, 0.5] : [0.38, 0.38, 0.38];
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(); }}><mesh scale={scale as [number, number, number]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={color} emissive={selected ? color : "#000000"} emissiveIntensity={selected ? 0.65 : 0.05} metalness={0.7} roughness={0.25} /></mesh><Text position={[0, -0.52, 0]} fontSize={0.1} color={selected ? "#35d6ff" : "#aab5ca"} anchorX="center" maxWidth={1}>{definition.name}</Text></group>;
}

export function SpacecraftCanvas() {
  const selectedComponents = useMissionStore((state) => state.selectedComponents);
  const spacecraft = useMemo(() => buildSpacecraft(selectedComponents), [selectedComponents]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return <div className="spacecraft-canvas" aria-label="Interactive spacecraft preview"><Canvas camera={{ position: [4, 3, 6], fov: 42 }}><color attach="background" args={["#07101f"]} /><ambientLight intensity={1.1} /><directionalLight position={[4, 4, 5]} intensity={2.4} color="#d7e8ff" /><pointLight position={[-3, 2, -2]} intensity={12} color="#35d6ff" /><gridHelper args={[8, 16, "#18345a", "#0f2240"]} rotation={[0, 0, 0]} /><group>{spacecraft.components.length === 0 ? <><mesh><boxGeometry args={[1.25, 0.8, 1.25]} /><meshStandardMaterial color="#35d6ff" wireframe /></mesh><Text position={[0, -1, 0]} fontSize={0.18} color="#aab5ca" anchorX="center">ADD COMPONENTS TO BEGIN</Text></> : spacecraft.components.map((item) => <Module key={item.instanceId} componentId={item.definitionId} position={[item.position.x, item.position.y, item.position.z]} selected={selectedId === item.instanceId} onSelect={() => setSelectedId(item.instanceId)} />)}</group><OrbitControls enablePan enableZoom minDistance={3} maxDistance={12} /></Canvas><div className="canvas-hud"><span>3D DESIGN BAY</span><small>{selectedId ? "Module selected" : "Drag to orbit / scroll to zoom"}</small></div></div>;
}
