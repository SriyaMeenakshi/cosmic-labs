"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";

const links = [
  { label: "Home", href: "/" },
  { label: "Missions", href: "/missions" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-nav shell">
        <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label="COSMIC LABS home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span><strong>COSMIC</strong><small>LABS / MISSION ARCHITECT</small></span>
        </Link>
        <button className="menu-toggle" aria-expanded={open} onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          <span /><span />
        </button>
        <nav className={`site-links ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <ActionButton href="/missions" className="nav-launch">Launch mission</ActionButton>
        </nav>
      </div>
    </header>
  );
}
