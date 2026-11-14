import { NextResponse } from "next/server";
import { answerMissionQuestion } from "@/src/advisor/fallback";
import type { EngineeringReport, MissionConfiguration } from "@/src/domain/types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { question?: string; configuration?: MissionConfiguration; report?: EngineeringReport };
    if (!body.question?.trim() || !body.configuration || !body.report) return NextResponse.json({ error: "Question, configuration, and engineering report are required." }, { status: 400 });
    return NextResponse.json({ answer: answerMissionQuestion(body.question, body.configuration, body.report), source: "deterministic-fallback" });
  } catch { return NextResponse.json({ error: "Unable to process advisor request." }, { status: 400 }); }
}
