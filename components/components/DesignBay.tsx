"use client";

import { ComponentLibrary } from "@/components/components/ComponentLibrary";
import { useMissionStore } from "@/src/state/missionStore";

type DesignBayProps = { defaultName: string };

export function DesignBay({ defaultName }: DesignBayProps) {
  const missionName = useMissionStore((state) => state.configuration?.name) ?? defaultName;
  return <ComponentLibrary missionName={missionName} />;
}
