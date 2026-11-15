"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useMissionStore } from "@/src/state/missionStore";

type Gesture = "open palm" | "pinch" | "two-hand pinch" | "point" | "thumbs up" | "closed fist" | "searching" | "unavailable";
type Point = { x: number; y: number };
const mediaPipeVersion = "1.2.3";
const skeletonLinks: [number, number][] = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }
function cameraError(error: unknown) { if (error instanceof DOMException) { if (error.name === "NotAllowedError" || error.name === "SecurityError") return "Camera permission denied. Allow camera access in the browser site settings."; if (error.name === "NotFoundError") return "No camera was found on this device."; if (error.name === "NotReadableError") return "The camera is busy in another application."; } return error instanceof Error ? error.message : "Camera or gesture model could not start."; }
function recognize(hand: Point[], pinch: boolean): Exclude<Gesture, "two-hand pinch" | "unavailable"> {
  if (pinch) return "pinch";
  // Compare fingertip reach to its PIP joint instead of assuming an upright hand pose.
  const extended = ([8, 12, 16, 20] as const).map((tip) => distance(hand[0], hand[tip]) > distance(hand[0], hand[tip - 2]) * 1.16);
  if (extended.every(Boolean)) return "open palm";
  const thumbUp = hand[4].y < hand[3].y && hand[4].y < hand[0].y - .08;
  if (thumbUp && !extended[1] && !extended[2] && !extended[3]) return "thumbs up";
  const folded = extended.filter(Boolean).length;
  if (folded === 0) return "closed fist";
  if (extended[0] && !extended[1] && !extended[2] && !extended[3]) return "point";
  return "searching";
}

export function GestureControlPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPublishedAt = useRef(0);
  const smoothPoints = useRef<(Point | null)[]>([null, null]);
  const lastHandAngle = useRef(0);
  const calibratedCenter = useRef<Point>({ x: .5, y: .5 });
  const pinchActive = useRef([false, false]);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("STANDBY / camera offline");
  const [gesture, setGesture] = useState<Gesture>("searching");
  const [hands, setHands] = useState<Point[][]>([]);
  const [handPoints, setHandPoints] = useState<Point[]>([]);
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
    streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null;
    landmarkerRef.current?.close(); landmarkerRef.current = null;
    setEnabled(false); setGesture("searching"); setHands([]); setHandPoints([]);
    smoothPoints.current = [null, null]; pinchActive.current = [false, false]; lastHandAngle.current = 0;
    setGestureState({ name: "searching", active: false, handPosition: null, secondHandPosition: null, handCount: 0, handRotation: 0, updatedAt: Date.now() });
    setStatus("STANDBY / camera offline");
  }

  async function startCamera() {
    try {
      if (!window.isSecureContext) throw new Error("Camera access requires HTTPS. Open the secure Vercel URL.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not support camera access.");
      setStatus("CONNECTING / requesting camera");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream; setEnabled(true);
      if (!videoRef.current) throw new Error("Camera preview is not available.");
      videoRef.current.srcObject = stream; await videoRef.current.play();
      setStatus("CALIBRATING / loading dual-hand model");
      const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${mediaPipeVersion}/wasm`);
      const model = { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task" }, runningMode: "VIDEO" as const, numHands: 2 };
      try { landmarkerRef.current = await HandLandmarker.createFromOptions(vision, { ...model, baseOptions: { ...model.baseOptions, delegate: "GPU" } }); }
      catch { landmarkerRef.current = await HandLandmarker.createFromOptions(vision, model); }
      setGestureState({ name: "searching", active: true, handPosition: null, secondHandPosition: null, handCount: 0, handRotation: 0, updatedAt: Date.now() });
      setStatus("LINK ACTIVE / dual-hand tracking ready");
      const detect = () => {
        const video = videoRef.current; const landmarker = landmarkerRef.current;
        if (!video || !landmarker || video.readyState < 2) { frameRef.current = requestAnimationFrame(detect); return; }
        const result = landmarker.detectForVideo(video, performance.now()); const now = performance.now();
        const rawHands = result.landmarks.slice(0, 2);
        if (rawHands.length && now - lastPublishedAt.current > 34) {
          const visualHands = rawHands.map((raw) => raw.map(({ x, y }) => ({ x, y })));
          const points = rawHands.map((raw, i) => {
            const next = { x: raw[9].x, y: raw[9].y }; const prior = smoothPoints.current[i] ?? next;
            const smooth = { x: prior.x + (next.x - prior.x) * .38, y: prior.y + (next.y - prior.y) * .38 }; smoothPoints.current[i] = smooth;
            const pinchDistance = distance(raw[4], raw[8]); pinchActive.current[i] = pinchActive.current[i] ? pinchDistance < .095 : pinchDistance < .065;
            return { x: 1 - Math.max(0, Math.min(1, .5 + (smooth.x - calibratedCenter.current.x) * sensitivity)), y: Math.max(0, Math.min(1, .5 + (smooth.y - calibratedCenter.current.y) * sensitivity)) };
          });
          if (rawHands.length < 2) { smoothPoints.current[1] = null; pinchActive.current[1] = false; }
          const bothPinched = rawHands.length === 2 && pinchActive.current[0] && pinchActive.current[1];
          const oneGesture = recognize(rawHands[0].map(({ x, y }) => ({ x, y })), pinchActive.current[0]);
          const nextGesture: Gesture = bothPinched ? "two-hand pinch" : oneGesture;
          const midpoint = rawHands.length === 2 ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 } : points[0];
          const screenRotation = bothPinched ? Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) : Math.atan2(rawHands[0][17].y - rawHands[0][5].y, rawHands[0][17].x - rawHands[0][5].x);
          const targetAngle = -screenRotation;
          const rotation = lastHandAngle.current + Math.atan2(Math.sin(targetAngle - lastHandAngle.current), Math.cos(targetAngle - lastHandAngle.current));
          lastHandAngle.current = rotation;
          setGesture(nextGesture); setHands(visualHands); setHandPoints(points);
          setGestureState({ name: nextGesture, active: true, handPosition: midpoint, secondHandPosition: rawHands.length === 2 ? points[1] : null, handCount: rawHands.length, handRotation: rotation, updatedAt: Date.now() });
          lastPublishedAt.current = now;
        } else if (!rawHands.length && now - lastPublishedAt.current > 80) {
          pinchActive.current = [false, false]; smoothPoints.current = [null, null]; lastHandAngle.current = 0;
          setGesture("searching"); setHands([]); setHandPoints([]);
          setGestureState({ name: "searching", active: true, handPosition: null, secondHandPosition: null, handCount: 0, handRotation: 0, updatedAt: Date.now() }); lastPublishedAt.current = now;
        }
        frameRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch (error) { await stopCamera(); setGesture("unavailable"); setStatus(`LINK ERROR / ${cameraError(error)}`); }
  }

  function calibrate() {
    const point = smoothPoints.current[0];
    if (point) { calibratedCenter.current = point; setStatus("CALIBRATED / neutral hand position saved"); }
    else setStatus("CALIBRATION WAITING / show your hand first");
  }

  const gestureLabel = gesture === "two-hand pinch" ? "BIMANUAL / MOVE + ROTATE" : gesture === "pinch" ? "GRAB / MOVE" : gesture === "open palm" ? "RELEASE / SNAP" : gesture === "point" ? "POINT / SELECT" : gesture === "thumbs up" ? "CONFIRM / LOCK" : gesture === "closed fist" ? "CANCEL / RESET" : gesture === "unavailable" ? "LINK ERROR" : "SEARCHING FOR HANDS";
  return <section className={`gesture-console ${enabled ? "is-online" : ""}`} aria-label="Gesture teleoperation console">
    <div className="gesture-console-heading"><div><p className="section-eyebrow">Optional / hands-free assembly</p><h2>Fit it by <span>hand.</span></h2><p>Point at a module, pinch to grab, then guide it into place. Pinch with both hands to rotate; open to dock. Fist cancels.</p></div><div className={`telemetry-live ${enabled ? "online" : ""}`}><i />{enabled ? `${hands.length} HAND${hands.length === 1 ? "" : "S"} TRACKED` : "CAMERA OFF"}</div></div>
    <div className="teleop-layout">
      <div className="teleop-camera"><div className="teleop-frame"><video ref={videoRef} muted playsInline aria-label="Mirrored two-hand tracking camera preview" /><div className="camera-grid" aria-hidden="true" /><div className="camera-corner corner-tl" /><div className="camera-corner corner-tr" /><div className="camera-corner corner-bl" /><div className="camera-corner corner-br" />{hands.map((landmarks, handIndex) => <svg key={handIndex} className={`hand-skeleton ${handIndex === 1 ? "gesture-skeleton-right" : ""}`} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">{skeletonLinks.map(([from, to]) => <line key={`${from}-${to}`} x1={1 - landmarks[from].x} y1={landmarks[from].y} x2={1 - landmarks[to].x} y2={landmarks[to].y} />)}{landmarks.map((point, index) => <circle key={index} cx={1 - point.x} cy={point.y} r={index === 4 || index === 8 ? .012 : .007} className={index === 4 || index === 8 ? "pinch-node" : ""} />)}</svg>)}{handPoints.map((point, index) => <div key={index} className={`hand-reticle ${gesture === "pinch" || gesture === "two-hand pinch" ? "is-grabbing" : ""} ${index === 1 ? "is-second-hand" : ""}`} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}><span /></div>)}<div className="camera-readout"><span>OPTICAL TRACKING / DUAL CAM 01</span><b>{gestureLabel}</b></div><div className="camera-coordinates">{handPoints.length ? `${handPoints.length} TRACKED · ${gesture === "two-hand pinch" ? "BIMANUAL CONTROL" : `X ${(handPoints[0].x * 100).toFixed(0)} · Y ${(handPoints[0].y * 100).toFixed(0)}`}` : "NO TARGET"}</div></div></div>
      <div className="teleop-instrument-panel"><div className="teleop-state"><span>LIVE COMMAND / {hands.length} HAND{hands.length === 1 ? "" : "S"}</span><strong>{gestureLabel}</strong><small>{status}</small></div><div className="gesture-sequence" aria-label="Gesture assembly steps"><div className={gesture === "point" ? "step-current" : ""}><b>01</b><span>AIM</span><small>Point</small></div><div className={gesture === "pinch" ? "step-current" : ""}><b>02</b><span>GRAB</span><small>Pinch</small></div><div className={gesture === "two-hand pinch" ? "step-current" : ""}><b>03</b><span>ALIGN</span><small>Two hands</small></div><div className={gesture === "open palm" || gesture === "thumbs up" ? "step-current" : ""}><b>04</b><span>LOCK</span><small>Open / 👍</small></div></div><div className="bimanual-readout"><span>ASSEMBLY FEEDBACK</span><b>{gesture === "two-hand pinch" ? "ROTATE + POSITION" : gesture === "open palm" || gesture === "thumbs up" ? "DOCKING MODULE" : gesture === "closed fist" ? "MODULE RESET" : "READY WHEN YOU ARE"}</b><small>Two-hand midpoint moves the part; the space between hands sets its angle.</small></div><label className="sensitivity-control"><span>HAND SENSITIVITY <b>{sensitivity.toFixed(2)}×</b></span><input type="range" min=".65" max="1.8" step=".05" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} /></label><div className="teleop-actions">{enabled ? <><button className="teleop-button teleop-button-secondary" type="button" onClick={calibrate}>◎ Recenter hands</button><button className="teleop-button teleop-button-stop" type="button" onClick={stopCamera}>■ End session</button></> : <button className="teleop-button teleop-button-start" type="button" onClick={startCamera}>◉ Start hand control <span>↗</span></button>}</div><div className="gesture-key"><span><i className="key-pinch" /> Pinch = grab · two hands = rotate</span><span><i className="key-open" /> Open / 👍 = snap to mount</span><span><i className="key-fist" /> Fist = cancel · point = select</span></div></div>
    </div>
    <div className="gesture-privacy"><span>LOCAL PROCESSING</span><p>Hand landmarks are processed in your browser. Camera video is not uploaded or recorded.</p></div>
  </section>;
}
