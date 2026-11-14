# COSMIC LABS — MISSION ARCHITECT

Build. Engineer. Launch. Discover.

COSMIC LABS is an educational space mission design game for the NASA Space Apps Challenge. Players select a destination, configure a mission, assemble a spacecraft from illustrative components, evaluate its engineering envelope, run a deterministic mission simulation, and review a debrief.

## Current experience

1. Select Mars, Moon, or asteroid exploration.
2. Configure mission name, objective, duration, budget, and difficulty.
3. Add spacecraft modules from the centralized component registry.
4. Inspect the modular 3D spacecraft preview with orbit and zoom controls.
5. Review live mass, power, battery, cost, and readiness metrics.
6. Run deterministic feasibility checks and ask the local NEBULA educational advisor questions.
7. Launch a staged simulation with a resource-management decision.
8. Review the mission debrief and explore NASA learning references.

## Technology

- Next.js App Router, React, TypeScript, and strict type checking
- Zustand with browser persistence for mission/design state
- Three.js, React Three Fiber, and Drei for the spacecraft preview
- MediaPipe Tasks Vision for optional hand-landmark recognition
- Framer Motion and a custom CSS design system

## Architecture

- `src/domain/` contains browser-independent TypeScript contracts.
- `src/missions/` contains centralized mission templates.
- `src/components/` contains the reusable spacecraft component registry.
- `src/engineering/` contains deterministic feasibility calculations.
- `src/spacecraft/` converts inventory counts to snapped spacecraft instances.
- `src/state/` owns persisted mission, design, simulation, and report state.
- `components/` contains UI adapters only; calculations remain outside React components.
- `app/api/advisor/` exposes a server-side rule-based advisor endpoint. No API key is required.

## Engineering assumptions

The game uses simplified educational calculations:

- Mass is the sum of selected component masses.
- Instantaneous power margin is generation minus consumption in watts.
- Battery capacity is stored energy in watt-hours and is not treated as power.
- Communications require both the high-gain antenna and transceiver.
- Mars and asteroid missions use a simplified propulsion requirement; lunar propulsion is optional.
- Budget is the sum of illustrative component credits.

These values are explicitly fictional game parameters. They are not NASA hardware specifications and do not certify a real mission.

## NASA references consulted

- [NASA State-of-the-Art Small Spacecraft Technology](https://www.nasa.gov/smallsat-institute/sst-soa/)
- [NASA JPL: Build a Satellite](https://www.jpl.nasa.gov/edu/resources/lesson-plan/build-a-satellite/)
- [NASA Science: Basics of Space Flight](https://science.nasa.gov/learn/basics-of-space-flight/)
- [NASA JPL: Design Your Spacecraft](https://www.jpl.nasa.gov/edu/resources/collection/mission-to-mars-student-challenge/education-plan-design-your-spacecraft/)

The in-app [Science Desk](/references) links directly to these official resources. COSMIC LABS does not claim to use NASA datasets.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run lint
npm run build -- --webpack
```

## Optional gesture controls

The design bay includes an explicit Enable camera control. Permission is requested only after activation. MediaPipe model assets are loaded from their public CDN, and the feature fails safely when a camera, permission, or model is unavailable. Mouse and keyboard interaction remain available.

## Limitations and next improvements

- The 3D scene uses generated primitive geometry rather than production spacecraft assets.
- Gesture recognition currently reports open-palm, pinch, and closed-fist states; it does not yet drag modules through 3D placement space.
- The advisor uses a deterministic fallback so the app works without Gemini credentials. A Gemini adapter can be added server-side without exposing secrets.
- The simulation is a deterministic educational state machine, not orbital mechanics or a certified mission simulator.
- Automated browser tests and deployment configuration should be added before public release.
