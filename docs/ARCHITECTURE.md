# COSMIC LABS — MISSION ARCHITECT

> Build. Engineer. Launch. Discover.

## Baseline inspection

The repository is currently an empty application scaffold. The only tracked files are [README.md](../README.md) and [LICENSE](../LICENSE); the initial commit contains no `package.json`, `src/`, configuration, tests, assets, or runtime entry point. Therefore there is no existing application behavior or dependency set to preserve. The first implementation should establish the Next.js shell and domain contracts described here.

## Proposed project structure

```text
cosmic-labs/
├─ app/                         # Next.js App Router routes and layouts
│  ├─ page.tsx                  # Mission dashboard entry screen
│  ├─ builder/page.tsx          # Spacecraft assembly workspace
│  ├─ simulation/page.tsx       # Simulation workspace
│  └─ api/advisor/route.ts      # Optional server-side Gemini boundary
├─ components/
│  ├─ builder/                  # 3D canvas, component palette, inspector
│  ├─ mission/                  # Mission cards, objectives, resource panels
│  ├─ simulation/               # Timeline, telemetry, event log
│  └─ ui/                       # Reusable presentational primitives
├─ src/
│  ├─ domain/types.ts           # Framework-independent TypeScript contracts
│  ├─ engineering/              # Mass, delta-v, power, thermal calculations
│  ├─ simulation/               # Deterministic state transitions and rules
│  ├─ vision/                   # MediaPipe adapter and gesture interpretation
│  ├─ ai/                       # Advisor prompt/schema/client abstractions
│  └─ state/                    # Zustand slices and selectors
├─ public/
│  ├─ models/                   # Optimized GLB spacecraft/component assets
│  └─ textures/
├─ tests/                       # Unit, integration, and browser evaluation tests
├─ docs/ARCHITECTURE.md
├─ package.json
├─ tsconfig.json
└─ tailwind.config.ts
```

The `app/` and `components/` layers may import domain services and state selectors. Domain, engineering, simulation, and vision modules must not import React or Three.js. This keeps calculations testable in Node and lets gesture input be replaced by mouse/touch controls.

## Domain contracts

The initial contracts are in [`src/domain/types.ts`](../src/domain/types.ts). They cover:

- `Mission`, constraints, objectives, status, and resource budgets.
- `ComponentDefinition`, `SpacecraftComponent`, and `Spacecraft` assembly state.
- `EngineeringSnapshot` for derived validation results.
- `SimulationState`, clock, events, and `SimulationEngine` transitions.

IDs are branded string types to prevent accidentally passing a component ID where a mission ID is expected. Dates are ISO strings at the boundary; calculations should convert them only when needed. Derived spacecraft totals should be recalculated by an engineering service rather than trusted from UI input.

## Runtime architecture

```text
UI (App Router + React)
  ├─ Zustand mission/editor store ──> domain models
  ├─ R3F/Drei renderer <───────────── spacecraft projection
  ├─ MediaPipe adapter ──────────────> GestureCommand
  ├─ Simulation controller ──────────> SimulationEngine.step()
  └─ Advisor client ─────────────────> server API boundary ──> Gemini

Engineering services and simulation engine remain framework-independent.
```

### 3D builder

The builder owns scene composition and interaction translation, not spacecraft truth. A component placement action becomes a typed editor command, the store updates the `Spacecraft`, and an engineering service returns a new `EngineeringSnapshot`. The renderer consumes a read-only projection of the current spacecraft. Use stable `instanceId` values and dispose of removed Three.js resources to prevent GPU leaks.

### Computer vision

`src/vision/` should expose a small adapter such as `HandTrackingProvider` and emit normalized commands (`select`, `grab`, `move`, `rotate`, `release`). MediaPipe landmarks, camera permissions, frame loops, and confidence thresholds stay inside the adapter. UI and builder code consume commands and never depend directly on MediaPipe landmark arrays. Mouse and touch should implement the same command interface for accessibility and fallback.

### Simulation

The engine should be deterministic: given `SimulationInput`, a seed, a state, and a timestep, `step()` returns the next state without DOM, timers, network calls, or Zustand dependencies. The controller owns animation-frame scheduling and maps engine states into the store. This permits fast unit tests, replayable missions, pause/resume, and future server verification without moving the engine into backend infrastructure.

### AI advisor

Gemini is optional and must sit behind an `Advisor` interface. The browser sends a minimized, validated mission summary to a Next.js route handler; the server owns the API key, rate limiting, timeout, and response schema validation. AI output is advisory text and recommendations only. It must not mutate mission state or replace deterministic engineering calculations. When unavailable, show local rule-based warnings from `EngineeringSnapshot`.

## Dependency plan

There are currently no installed dependencies. Bootstrap the project with:

```powershell
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir=false --use-npm
npm install three @react-three/fiber @react-three/drei zustand framer-motion recharts
npm install @mediapipe/tasks-vision
npm install -D @types/three vitest jsdom @testing-library/react @testing-library/jest-dom
```

Add a Gemini SDK only when the advisor route is implemented; keep it server-only. Avoid adding a physics engine, database, authentication, or backend service during the foundation phase. They are not required for the local game loop and would add deployment and state-consistency costs.

## Implementation order

This is the roadmap, not Phase 1 execution:

1. Foundation: Next.js shell, strict TypeScript, linting, test runner, domain contracts, and a small component catalog.
2. Engineering core: pure mass, delta-v, power, thermal, and constraint-validation functions with unit tests.
3. Mission/editor state: Zustand slices, selectors, undo-friendly commands, persistence only if needed.
4. 3D builder: R3F scene, asset loading, snapping/connection rules, inspector, and mouse/touch controls.
5. Gesture input: MediaPipe adapter, permission lifecycle, confidence handling, and command mapping.
6. Simulation: deterministic engine, event log, telemetry panels, pause/replay, and failure states.
7. Advisor: server route, schema-validated Gemini response, local fallback, and explicit loading/error states.
8. NASA Space Apps polish: onboarding, accessibility, performance pass, demo mission, and deployment validation.

Do not begin the next stage until its domain boundary and validation evidence are stable.

## Technical risks and mitigations

- **3D asset and performance cost:** keep GLB assets low-poly, lazy-load the builder, cap device pixel ratio, and avoid rebuilding the scene on every telemetry tick.
- **MediaPipe browser support and permissions:** feature-detect camera access, lazy-load the vision model, provide a clear permission state, and retain mouse/touch fallback.
- **Gesture ambiguity:** use confidence thresholds, dwell/debounce timing, and a visible gesture state; never make a low-confidence gesture destructive.
- **Physics credibility:** start with transparent simplified equations and visible assumptions; keep the engine deterministic and test every boundary condition.
- **State mutation across UI and simulation:** enforce command-based updates and immutable state transitions; derive totals in one engineering module.
- **AI reliability and cost:** keep AI optional, validate structured responses, redact unnecessary data, use timeouts, and never let AI decide whether a spacecraft is physically valid.
- **Client bundle size:** dynamically import R3F, MediaPipe, and charts on the routes that use them.
- **Scope creep:** no persistence, accounts, multiplayer, or server simulation until the local single-player loop is demonstrably fun and stable.

## Foundation exit criteria

The foundation is complete when the repository has the planned Next.js scaffold, strict TypeScript checks, the framework-independent contracts in [`src/domain/types.ts`](../src/domain/types.ts), and tests proving the first engineering calculations. This document intentionally stops before implementing the builder, vision pipeline, simulation loop, or AI advisor.
