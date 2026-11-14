import Link from "next/link";
import { MissionSelection } from "@/components/missions/MissionSelection";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export default function MissionsPage() {
  return <main className="subpage"><div className="shell subpage-inner"><Link className="back-link" href="/">← Return to mission control</Link><SectionEyebrow>Mission selection / archive 02</SectionEyebrow><h1>Choose your <span>unknown.</span></h1><p className="subpage-lede">Select a destination and begin with a real engineering question. Each mission carries a different operating envelope.</p><MissionSelection /></div></main>;
}
