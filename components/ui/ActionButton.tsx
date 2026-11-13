import Link from "next/link";
import type { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
};

export function ActionButton({ children, href, variant = "primary", className = "" }: ActionButtonProps) {
  const variants = {
    primary: "button-primary",
    secondary: "button-secondary",
    quiet: "button-quiet",
  };

  return (
    <Link className={`${variants[variant]} ${className}`} href={href}>
      {children}
      <span aria-hidden="true" className="button-arrow">↗</span>
    </Link>
  );
}
