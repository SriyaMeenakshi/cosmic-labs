"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import { componentRegistry } from "@/src/components/registry";
import { useMissionStore } from "@/src/state/missionStore";
import { buildSpacecraft } from "@/src/spacecraft/buildModel";

type ShapeProps = { color: string; selected: boolean };

function Material({ color, selected }: ShapeProps) { return <meshStandardMaterial color={color} emissive={selected ? color : "#000000"} emissiveIntensity={selected ? 0.55 : 0.04} metalness={0.72} roughness={0.24} />; }

function ComponentShape({ componentId, color, selected }: { componentId: string; color: string; selected: boolean }) {
  const material = <Material color={color} selected={selected} />;
  switch (componentId) {
    case "structure-main-bus": return <group><mesh><boxGeometry args={[1.05, .7, 1.05]} />{material}</mesh><mesh position={[0, .42, 0]}><cylinderGeometry args={[.32, .32, .12, 6]} />{material}</mesh><mesh position={[0, -.42, 0]}><cylinderGeometry args={[.28, .28, .12, 6]} />{material}</mesh></group>;
    case "structure-equipment-frame": return <group><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.45, .06, 8, 6]} />{material}</mesh><mesh rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[.9, .05, .05]} />{material}</mesh></group>;
    case "structure-module": return <group><mesh><boxGeometry args={[.75, .58, .75]} />{material}</mesh><mesh scale={[1.06, 1.06, 1.06]}><boxGeometry args={[.75, .58, .75]} /><meshBasicMaterial color={color} wireframe transparent opacity={.65} /></mesh></group>;
    case "power-solar-panels": return <group><mesh position={[-.58, 0, 0]}><boxGeometry args={[.8, .04, .55]} />{material}</mesh><mesh position={[.58, 0, 0]}><boxGeometry args={[.8, .04, .55]} />{material}</mesh><mesh><boxGeometry args={[.12, .08, .3]} />{material}</mesh></group>;
    case "power-rechargeable-battery": return <group><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.28, .28, .7, 12]} />{material}</mesh><mesh position={[.36, 0, 0]}><boxGeometry args={[.05, .16, .18]} />{material}</mesh></group>;
    case "power-distribution-unit": return <group><mesh><boxGeometry args={[.62, .25, .48]} />{material}</mesh>{[-.2, 0, .2].map((x) => <mesh key={x} position={[x, .18, 0]}><cylinderGeometry args={[.04, .04, .1, 8]} />{material}</mesh>)}</group>;
    case "communication-high-gain-antenna": return <group><mesh rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[.48, .28, 24, 1, true]} />{material}</mesh><mesh position={[0, -.35, 0]}><cylinderGeometry args={[.035, .035, .7, 8]} />{material}</mesh></group>;
    case "communication-transceiver": return <group><mesh><boxGeometry args={[.48, .24, .36]} />{material}</mesh><mesh position={[0, .23, 0]}><cylinderGeometry args={[.025, .025, .3, 8]} />{material}</mesh></group>;
    case "science-navigation-camera": return <group><mesh rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[.2, .2, .35, 16]} />{material}</mesh><mesh rotation={[0, Math.PI / 2, 0]} position={[.2, 0, 0]}><cylinderGeometry args={[.12, .12, .03, 16]} /><meshStandardMaterial color="#08101e" metalness={.9} roughness={.1} /></mesh></group>;
    case "science-scientific-camera": return <group><mesh rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[.25, .22, .5, 16]} />{material}</mesh><mesh rotation={[0, Math.PI / 2, 0]} position={[.28, 0, 0]}><cylinderGeometry args={[.16, .16, .04, 16]} /><meshStandardMaterial color="#08101e" metalness={.9} roughness={.1} /></mesh></group>;
    case "science-spectrometer": return <group><mesh><boxGeometry args={[.55, .3, .35]} />{material}</mesh><mesh position={[.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[.16, .14, 6]} />{material}</mesh></group>;
    case "propulsion-engine": return <group><mesh rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[.27, .6, 12]} />{material}</mesh><mesh position={[0, .33, 0]}><cylinderGeometry args={[.12, .12, .12, 12]} />{material}</mesh></group>;
    case "propulsion-fuel-tank": return <group><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.3, .3, .78, 16]} />{material}</mesh><mesh position={[0, .42, 0]}><cylinderGeometry args={[.1, .1, .1, 12]} />{material}</mesh></group>;
    case "propulsion-thruster-module": return <group><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.18, .18, .4, 12]} />{material}</mesh><mesh position={[0, -.24, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[.15, .18, 12]} />{material}</mesh></group>;
    default: return <mesh><sphereGeometry args={[.3, 16, 12]} />{material}</mesh>;
  }
}

function Module({ componentId, position, selected, onSelect }: { componentId: string; position: [number, number, number]; selected: boolean; onSelect: () => void }) {
  const definition = componentRegistry.find((item) => item.id === componentId);
  if (!definition) return null;
  const color = definition.category === "power" ? "#ffb547" : definition.category === "communication" ? "#8865ff" : definition.category === "propulsion" ? "#ff5364" : definition.category === "science" ? "#f4f7ff" : "#35d6ff";
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(); }}><ComponentShape componentId={componentId} color={color} selected={selected} /><Text position={[0, -.62, 0]} fontSize={.1} color={selected ? "#35d6ff" : "#aab5ca"} anchorX="center" maxWidth={1}>{definition.name}</Text></group>;
}

export function SpacecraftCanvas() {
  const selectedComponents = useMissionStore((state) => state.selectedComponents);
  const spacecraft = useMemo(() => buildSpacecraft(selectedComponents), [selectedComponents]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return <div className="spacecraft-canvas" aria-label="Interactive spacecraft preview"><Canvas camera={{ position: [4, 3, 6], fov: 42 }}><color attach="background" args={["#07101f"]} /><ambientLight intensity={1.1} /><directionalLight position={[4, 4, 5]} intensity={2.4} color="#d7e8ff" /><pointLight position={[-3, 2, -2]} intensity={12} color="#35d6ff" /><gridHelper args={[8, 16, "#18345a", "#0f2240"]} /><group>{spacecraft.components.length === 0 ? <><mesh><boxGeometry args={[1.25, .8, 1.25]} /><meshStandardMaterial color="#35d6ff" wireframe /></mesh><Text position={[0, -1, 0]} fontSize={.18} color="#aab5ca" anchorX="center">ADD COMPONENTS TO BEGIN</Text></> : spacecraft.components.map((item) => <Module key={item.instanceId} componentId={item.definitionId} position={[item.position.x, item.position.y, item.position.z]} selected={selectedId === item.instanceId} onSelect={() => setSelectedId(item.instanceId)} />)}</group><OrbitControls enablePan enableZoom minDistance={3} maxDistance={12} /></Canvas><div className="canvas-hud"><span>3D DESIGN BAY</span><small>{selectedId ? "Module selected" : "Drag to orbit / scroll to zoom"}</small></div></div>;
}
