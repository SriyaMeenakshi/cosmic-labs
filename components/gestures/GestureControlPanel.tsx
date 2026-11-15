"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useMissionStore } from "@/src/state/missionStore";

type Gesture = "open palm" | "pinch" | "closed fist" | "searching" | "unavailable";
const mediaPipeVersion = "1.2.3";

function distance(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y); }
function cameraError(error: unknown) { if (error instanceof DOMException) { if (error.name === "NotAllowedError" || error.name === "SecurityError") return "Camera permission was denied. Allow camera access in the browser address bar and try again."; if (error.name === "NotFoundError") return "No camera was found on this device."; if (error.name === "NotReadableError") return "The camera is already being used by another application."; } return error instanceof Error ? error.message : "Camera or gesture model could not be started."; }

export function GestureControlPanel() {
  const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null); const landmarkerRef = useRef<HandLandmarker | null>(null); const frameRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false); const [status, setStatus] = useState("Camera is off"); const [gesture, setGesture] = useState<Gesture>("searching"); const setGestureState = useMissionStore((state) => state.setGestureState);
  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); streamRef.current?.getTracks().forEach((track) => track.stop()); landmarkerRef.current?.close(); }, []);
  async function stopCamera() { if (frameRef.current) cancelAnimationFrame(frameRef.current); frameRef.current = null; streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; landmarkerRef.current?.close(); landmarkerRef.current = null; setEnabled(false); setGesture("searching"); setGestureState({ name: "searching", handPosition: null, handRotation: 0, updatedAt: Date.now() }); setStatus("Camera is off"); }
  async function startCamera() {
    try {
      if (!window.isSecureContext) throw new Error("Camera access requires HTTPS. Open the deployed HTTPS URL, not an insecure HTTP address.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access is not supported in this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream; setEnabled(true); if (!videoRef.current) throw new Error("Camera preview is unavailable."); videoRef.current.srcObject = stream; await videoRef.current.play(); setStatus("Loading gesture model…");
      const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${mediaPipeVersion}/wasm`);
      const options = { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task" }, runningMode: "VIDEO" as const, numHands: 1 };
      try { landmarkerRef.current = await HandLandmarker.createFromOptions(vision, { ...options, baseOptions: { ...options.baseOptions, delegate: "GPU" } }); } catch { landmarkerRef.current = await HandLandmarker.createFromOptions(vision, options); }
      setStatus("Gesture tracking active");
      const detect = () => { const video = videoRef.current; const landmarker = landmarkerRef.current; if (!video || !landmarker || video.readyState < 2) { frameRef.current = requestAnimationFrame(detect); return; } const result = landmarker.detectForVideo(video, performance.now()); const landmarks = result.landmarks[0]; if (!landmarks) { setGesture("searching"); setGestureState({ name: "searching", handPosition: null, handRotation: 0, updatedAt: Date.now() }); } else { const pinch = distance(landmarks[4], landmarks[8]) < .07; const fingersFolded = [8, 12, 16, 20].filter((tip) => landmarks[tip].y > landmarks[tip - 2].y).length; const nextGesture = pinch ? "pinch" : fingersFolded === 4 ? "closed fist" : fingersFolded <= 1 ? "open palm" : "searching"; const handRotation = Math.atan2(landmarks[17].y - landmarks[5].y, landmarks[17].x - landmarks[5].x); setGesture(nextGesture); setGestureState({ name: nextGesture, handPosition: { x: landmarks[9].x, y: landmarks[9].y }, handRotation, updatedAt: Date.now() }); } frameRef.current = requestAnimationFrame(detect); }; detect();
    } catch (error) { await stopCamera(); setGesture("unavailable"); setStatus(cameraError(error)); }
  }
  return <section className="gesture-panel" aria-label="Optional gesture controls"><div><p className="section-eyebrow">Phase 5 / optional control</p><h2>Hands on the mission.</h2><p>Pinch near a module to pick it up, move your hand through the design bay, rotate your hand to rotate the module, then open your palm to snap it to the nearest cyan attachment socket. Make a fist to cancel.</p></div><div className="gesture-preview"><video ref={videoRef} muted playsInline aria-label="Camera preview" /><div className="gesture-status"><span className={enabled ? "status-live" : ""} />{status}</div><strong>{gesture === "searching" ? "No hand detected" : gesture === "unavailable" ? "Unavailable" : gesture}</strong></div><div className="gesture-actions">{enabled ? <button className="button-secondary" type="button" onClick={stopCamera}>Disable camera</button> : <button className="button-primary" type="button" onClick={startCamera}>Enable camera</button>}<small>Camera permission is requested only after you enable this panel.</small></div></section>;
}
