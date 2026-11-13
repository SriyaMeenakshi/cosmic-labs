import type { ReactNode } from "react";

type SectionEyebrowProps = { children: ReactNode };

export function SectionEyebrow({ children }: SectionEyebrowProps) {
  return <p className="section-eyebrow">{children}</p>;
}
