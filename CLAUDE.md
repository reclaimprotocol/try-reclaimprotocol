# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A demo/playground website for the Reclaim Protocol JS SDK (`@reclaimprotocol/js-sdk`), deployed at [try.reclaimprotocol.org](https://www.try.reclaimprotocol.org/). The code doubles as **teaching material**: it is written to show developers how to integrate the SDK, so clarity of the integration flow takes priority over typical app concerns.

Two conventions follow from this and matter when editing:
- Code marked `@deprecated` with "This should happen on your backend" (everything in `src/service/reclaim.ts`) is run in the browser **on purpose** for the demo. In real integrations these calls belong on a server. Do not "fix" them by moving them — they illustrate backend responsibilities.
- Comment blocks fenced with `// ==== IGNORE START ====` / `// ==== IGNORE END ====` mark demo decoration (live background, status tiles). Everything outside those fences is the canonical SDK-usage example a reader is meant to copy.

## Commands

```bash
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # tsc -b && vite build  (type-check is part of the build)
npm run lint       # eslint
npm run format     # prettier --write
npm run preview    # serve the production build
```

There is no test suite. `npm run build` is the gate — it type-checks all projects via `tsc -b` before bundling.

Note: `vite` is overridden to `npm:rolldown-vite` (the Rolldown-based Vite) in both `dependencies` and `overrides`. React Compiler is enabled via `babel-plugin-react-compiler` in `vite.config.ts`.

### Environment

Copy `.env.example` to `.env` and set `VITE_RECLAIM_APP_ID` and `VITE_RECLAIM_APP_SECRET` (from [dev.reclaimprotocol.org](https://dev.reclaimprotocol.org)). Optional `VITE_RECLAIM_BACKEND_URL` overrides the default `https://api.reclaimprotocol.org` (see `src/service/backend.ts`).

## Architecture

React 19 + TypeScript + Tailwind CSS v4, routed with React Router v7's data router (`createBrowserRouter`).

Routing uses a Next.js-style file convention even though it's React Router: routes are declared in `src/routes.tsx`, and each route's component lives at `src/app/<route>/page.tsx`. `src/Root.tsx` is the layout (Navbar + `<Outlet />`). Routes: `/` (provider selection), `/verify`, `/expert`, `/playground`.

### The verification flow (the core demo)

This is the path a reader is meant to learn, threaded across three files:

1. `src/components/StartVerificationButton/index.tsx` — calls the "backend" to create a `ReclaimProofRequest`, gets back a JSON string, base64-encodes it, and navigates to `/verify?request=<encoded>`. (The base64/URL hop is incidental to the demo, not an SDK requirement.)
2. `src/service/reclaim.ts` — `YourBackendUsingReclaim`, the simulated backend. `createVerificationRequest` / `createVerificationRequestAsExpert` build the request; `processProof` is the critical security pattern: call `verifyProof(...)` and then validate the extracted fields against business requirements before trusting a proof.
3. `src/app/verify/page.tsx` — recreates the request with `ReclaimProofRequest.fromJsonString`, launches the flow, and registers `startSession({ onSuccess, onError })`. `onSuccess` always re-verifies via `processProof` even though SDK-delivered proofs are already verified.

The launch method (`js-sdk.portal` | `js-sdk.app` | `windowopen`) comes from expert settings and selects how `triggerReclaimFlow` / `getRequestUrl` is invoked.

### Expert mode

`src/contexts/ExpertContext.tsx` holds `ExpertSettings` (shape in `src/service/expert.ts`), persisted to `localStorage` under `reclaim_expert_settings`. When `isExpertModeEnabled` is true, `createVerificationRequestAsExpert` maps these settings onto the SDK's advanced options (callbacks, redirects, app-clip, browser extension, locale, metadata, etc.). Use the `useSelectFromExpertSettings` selector hook to read a setting; it falls back to `defaultSettings` when expert mode is off. The `/expert` page edits these.

### Mango — Go/WASM string evaluation

`internal/mango/` is a **separate Go module** compiled to WebAssembly, used only by the `/playground` page. It exposes `window.reclaimStrings.evaluateJsonPath` and `evaluateXPath`, backed by Reclaim's `jsonpathplus-go` and `xpath-go` libraries — so the playground evaluates paths with the exact semantics (including byte-offset ranges) of the Reclaim attestor, not a JS reimplementation.

- Loaded lazily by `installReclaimStrings()` in `src/utils/reclaim_strings.ts`, which injects `public/mango/wasm_exec.js` and instantiates `public/mango/mango.wasm`.
- The committed `public/mango/*.wasm` artifact is what ships. To rebuild after changing Go code, run `bash scripts/vendor.sh` (requires Go 1.25; runs `make build` in `internal/mango` and copies the artifacts into `public/mango/`). `package.json` does **not** rebuild the WASM — it must be done manually and committed.
- Go bindings/entry: `internal/mango/cmd/main.go`; logic: `internal/mango/pkg/mango/mango.go`.
