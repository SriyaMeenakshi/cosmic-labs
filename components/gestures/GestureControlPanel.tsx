"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useMissionStore } from "@/src/state/missionStore";

type Gesture = "open palm" | "pinch" | "closed fist" | "searching" | "unavailable";
type Point = { x: number; y: number };
const mediaPipeVersion = "1.2.3";
const skeletonLinks: [number, number][] = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }
function cameraError(error: unknown) { if (error instanceof DOMException) { if (error.name === "NotAllowedError" || error.name === "SecurityError") return "Camera permission denied. Allow camera access in the browser site settings."; if (error.name === "NotFoundError") return "No camera was found on this device."; if (error.name === "NotReadableError") return "The camera is busy in another application."; } return error instanceof Error ? error.message : "Camera or gesture model could not start."; }

export function GestureControlPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPublishedAt = useRef(0);
  const smoothedPoint = useRef<Point | null>(null);
  const calibratedCenter = useRef<Point>({ x: .5, y: .5 });
  const pinchActive = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("STANDBY / camera offline");
  const [gesture, setGesture] = useState<Gesture>("searching");
  const [landmarks, setLandmarks] = useState<Point[]>([]);
  const [handPoint, setHandPoint] = useState<Point | null>(null);
  const [sensitivity, setSensitivity] = useState(1.15);
  const setGestureState = useMissionStore((state) => state.setGestureState);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    landmarkerRef.current?.close();
  }, []);

  async function stopCamera() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    setEnabled(false);
    setGesture("searching");
    setLandmarks([]);
    setHandPoint(null);
    pinchActive.current = false;
    setGestureState({ name: "searching", active: false, handPosition: null, handRotation: 0, updatedAt: Date.now() });
    setStatus("STANDBY / camera offline");
  }

  async function startCamera() {
    try {
      if (!window.isSecureContext) throw new Error("Camera access requires HTTPS. Open the secure Vercel URL.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not support camera access.");
      setStatus("CONNECTING / requesting camera");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream;
      setEnabled(true);
      if (!videoRef.current) throw new Error("Camera preview is not available.");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("CALIBRATING / loading hand model");
      const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${mediaPipeVersion}/wasm`);
      const model = { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task" }, runningMode: "VIDEO" as const, numHands: 1 };
      try { landmarkerRef.current = await HandLandmarker.createFromOptions(vision, { ...model, baseOptions: { ...model.baseOptions, delegate: "GPU" } }); }
      catch { landmarkerRef.current = await HandLandmarker.createFromOptions(vision, model); }
      setGestureState({ name: "searching", active: true, handPosition: null, handRotation: 0, updatedAt: Date.now() });
      setStatus("LINK ACTIVE / hand tracking ready");
      const detect = () => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !landmarker || video.readyState < 2) { frameRef.current = requestAnimationFrame(detect); return; }
        const result = landmarker.detectForVideo(video, performance.now());
        const raw = result.landmarks[0];
        const now = performance.now();
        if (raw) {
          const nextPoint = { x: raw[9].x, y: raw[9].y };
          const prior = smoothedPoint.current ?? nextPoint;
          const point = { x: prior.x + (nextPoint.x - prior.x) * .38, y: prior.y + (nextPoint.y - prior.y) * .38 };
          smoothedPoint.current = point;
          const pinchDistance = distance(raw[4], raw[8]);
          pinchActive.current = pinchActive.current ? pinchDistance < .095 : pinchDistance < .065;
          const folded = [8, 12, 16, 20].filter((tip) => raw[tip].y > raw[tip - 2].y).length;
          const nextGesture: Gesture = pinchActive.current ? "pinch" : folded >= 4 ? "closed fist" : folded <= 1 ? "open palm" : "searching";
          if (now - lastPublishedAt.current > 38) {
            const centered = { x: .5 + (point.x - calibratedCenter.current.x) * sensitivity, y: .5 + (point.y - calibratedCenter.current.y) * sensitivity };
            const position = { x: 1 - Math.max(0, Math.min(1, centered.x)), y: Math.max(0, Math.min(1, centered.y)) };
            const roll = Math.atan2(raw[17].y - raw[5].y, raw[17].x - raw[5].x);
            setGesture(nextGesture);
            setLandmarks(raw.map(({ x, y }) => ({ x, y })));
            setHandPoint(position);
            setGestureState({ name: nextGesture, active: true, handPosition: position, handRotation: roll, updatedAt: Date.now() });
            lastPublishedAt.current = now;
          }
        } else if (now - lastPublishedAt.current > 80) {
          pinchActive.current = false;
          setGesture("searching"); setLandmarks([]); setHandPoint(null);
          setGestureState({ name: "searching", active: true, handPosition: null, handRotation: 0, updatedAt: Date.now() });
          lastPublishedAt.current = now;
        }
        frameRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch (error) {
      await stopCamera();
      setGesture("unavailable");
      setStatus(`LINK ERROR / ${cameraError(error)}`);
    }
  }

  function calibrate() {
    if (smoothedPoint.current) { calibratedCenter.current = smoothedPoint.current; setStatus("CALIBRATED / neutral hand position saved"); }
    else setStatus("CALIBRATION WAITING / show your hand first");
  }

  const gestureLabel = gesture === "pinch" ? "GRAB / MOVE" : gesture === "open palm" ? "RELEASE / SNAP" : gesture === "closed fist" ? "CANCEL / RESET" : gesture === "unavailable" ? "LINK ERROR" : "SEARCHING FOR HAND";
  return <section className={`gesture-console ${enabled ? "is-online" : ""}`} aria-label="Gesture teleoperation console">
    <div className="gesture-console-heading"><div><p className="section-eyebrow">Phase 5 / human-machine interface</p><h2>Teleoperate the <span>assembly.</span></h2><p>Your hand becomes a precision controller. Grab a module, guide it through the assembly volume, roll to orient, then release to lock it onto a mount.</p></div><div className={`telemetry-live ${enabled ? "online" : ""}`}><i />{enabled ? "LIVE TRACKING" : "SYSTEM STANDBY"}</div></div>
    <div className="teleop-layout">
      <div className="teleop-camera"><div className="teleop-frame"><video ref={videoRef} muted playsInline aria-label="Mirrored hand tracking camera preview" /><div className="camera-grid" aria-hidden="true" /><div className="camera-corner corner-tl" /><div className="camera-corner corner-tr" /><div className="camera-corner corner-bl" /><div className="camera-corner corner-br" />{landmarks.length > 0 && <svg className="hand-skeleton" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">{skeletonLinks.map(([from, to]) => <line key={`${from}-${to}`} x1={1 - landmarks[from].x} y1={landmarks[from].y} x2={1 - landmarks[to].x} y2={landmarks[to].y} />)}{landmarks.map((point, index) => <circle key={index} cx={1 - point.x} cy={point.y} r={index === 4 || index === 8 ? .012 : .007} className={index === 4 || index === 8 ? "pinch-node" : ""} />)}</svg>}{handPoint && <div className={`hand-reticle ${gesture === "pinch" ? "is-grabbing" : ""}`} style={{ left: `${handPoint.x * 100}%`, top: `${handPoint.y * 100}%` }}><span /></div>}<div className="camera-readout"><span>OPTICAL TRACKING / CAM 01</span><b>{gestureLabel}</b></div><div className="camera-coordinates">{handPoint ? `X ${(handPoint.x * 100).toFixed(0)} · Y ${(handPoint.y * 100).toFixed(0)}` : "NO TARGET"}</div></div></div>
      <div className="teleop-instrument-panel"><div className="teleop-state"><span>GESTURE COMMAND</span><strong>{gestureLabel}</strong><small>{status}</small></div><div className="gesture-sequence"><div className={gesture === "open palm" ? "step-current" : ""}><b>01</b><span>OPEN</span><small>Control hand</small></div><div className={gesture === "pinch" ? "step-current" : ""}><b>02</b><span>PINCH</span><small>Grab module</small></div><div><b>03</b><span>RELEASE</span><small>Snap to mount</small></div></div><label className="sensitivity-control"><span>HAND SENSITIVITY <b>{sensitivity.toFixed(2)}×</b></span><input type="range" min=".65" max="1.8" step=".05" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} /></label><div className="teleop-actions">{enabled ? <><button className="teleop-button teleop-button-secondary" type="button" onClick={calibrate}>◎ Recalibrate</button><button className="teleop-button teleop-button-stop" type="button" onClick={stopCamera}>■ Stop session</button></> : <button className="teleop-button teleop-button-start" type="button" onClick={startCamera}>◉ Initialize teleoperation <span>↗</span></button>}</div><div className="gesture-key"><span><i className="key-pinch" /> Pinch = grab / rotate</span><span><i className="key-open" /> Open = snap in place</span><span><i className="key-fist" /> Fist = cancel</span></div></div>
    </div>
    <div className="gesture-privacy"><span>LOCAL PROCESSING</span><p>Hand landmarks are processed in your browser. Camera video is not uploaded or recorded.</p></div>
  </section>;
}
