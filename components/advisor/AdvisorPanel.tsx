"use client";

import { useState } from "react";
import type { EngineeringReport, MissionConfiguration } from "@/src/domain/types";

export function AdvisorPanel({ configuration, report }: { configuration: MissionConfiguration; report: EngineeringReport }) {
  const [question, setQuestion] = useState("Why is my mission ready or not ready?");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  async function ask() { setLoading(true); setAnswer(""); try { const response = await fetch("/api/advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, configuration, report }) }); const data = await response.json() as { answer?: string; error?: string }; setAnswer(data.answer ?? data.error ?? "No answer available."); } catch { setAnswer("Advisor unavailable. Use the engineering checks above to inspect the design."); } finally { setLoading(false); } }
  return <section className="advisor-panel"><div><p className="section-eyebrow">NEBULA AI / educational advisor</p><h2>Ask the mission console.</h2><p>Answers are grounded in the current deterministic design report. No external AI service is required.</p></div><div className="advisor-form"><label htmlFor="advisor-question">Question</label><div><input id="advisor-question" value={question} onChange={(event) => setQuestion(event.target.value)} /><button className="button-primary" type="button" onClick={ask} disabled={loading}>{loading ? "Thinking…" : "Ask"}</button></div></div>{answer && <p className="advisor-answer">{answer}</p>}</section>;
}
