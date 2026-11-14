"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

type Gesture = "open palm" | "pinch" | "closed fist" | "searching" | "unavailable";

function distance(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y); }

export function GestureControlPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const frameRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Camera is off");
  const [gesture, setGesture] = useState<Gesture>("searching");

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); streamRef.current?.getTracks().forEach((track) => track.stop()); landmarkerRef.current?.close(); }, []);

  async function stopCamera() { if (frameRef.current) cancelAnimationFrame(frameRef.current); streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; setEnabled(false); setGesture("searching"); setStatus("Camera is off"); }

  async function startCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera is not supported in this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setEnabled(true); setStatus("Loading hand landmark model…");
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm");
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", delegate: "GPU" }, runningMode: "VIDEO", numHands: 1 });
      setStatus("Gesture tracking active");
      const detect = () => { const video = videoRef.current; const landmarker = landmarkerRef.current; if (!video || !landmarker || video.readyState < 2) { frameRef.current = requestAnimationFrame(detect); return; } const result = landmarker.detectForVideo(video, performance.now()); const landmarks = result.landmarks[0]; if (!landmarks) setGesture("searching"); else { const pinch = distance(landmarks[4], landmarks[8]) < 0.07; const fingersFolded = [8, 12, 16, 20].filter((tip) => landmarks[tip].y > landmarks[tip - 2].y).length; setGesture(pinch ? "pinch" : fingersFolded === 4 ? "closed fist" : fingersFolded <= 1 ? "open palm" : "searching"); } frameRef.current = requestAnimationFrame(detect); }; detect();
    } catch (error) { await stopCamera(); setGesture("unavailable"); setStatus(error instanceof Error ? error.message : "Camera permission or model loading failed."); }
  }

  return <section className="gesture-panel" aria-label="Optional gesture controls"><div><p className="section-eyebrow">Phase 5 / optional control</p><h2>Hands on the mission.</h2><p>Enable your camera to experiment with open-palm, pinch, and closed-fist recognition. Mouse and keyboard controls always remain available.</p></div><div className="gesture-preview"><video ref={videoRef} muted playsInline aria-label="Camera preview" /><div className="gesture-status"><span className={enabled ? "status-live" : ""} />{status}</div><strong>{gesture === "searching" ? "No hand detected" : gesture === "unavailable" ? "Unavailable" : gesture}</strong></div><div className="gesture-actions">{enabled ? <button className="button-secondary" type="button" onClick={stopCamera}>Disable camera</button> : <button className="button-primary" type="button" onClick={startCamera}>Enable camera</button>}<small>Camera permission is requested only after you enable this panel.</small></div></section>;
}
