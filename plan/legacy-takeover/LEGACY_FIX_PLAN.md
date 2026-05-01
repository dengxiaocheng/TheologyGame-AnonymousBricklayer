# Legacy Fix Plan — game7-anonymous-bricklayer

## Status: Phase 3 Blocked by 9 Integration Bugs

Phase 1 (skeleton) and Phase 2 (models+data) passed. Phase 3 failed twice.
Root cause: engine modules were built in isolation with mismatched interfaces.

## Repair Strategy: Bottom-Up Integration Fix

### Layer 1 — Namespace & API Stubs (fix 3 bugs)
Expose missing public methods that callers expect:
- `Kiln.Grace.addPoints(points, action)` → public wrapper around `_addGracePoints`
- `Kiln.WorkerMgr` → alias to `Kiln.WorkerSafety.manager` (set after initWorkers)
- Fix `getActiveInputs()` return type handling in main.js

### Layer 2 — Lifecycle Wiring (fix 3 bugs)
Connect init/update call chains in main.js:
- Call `Kiln.WorkerSafety.initWorkers(shiftNum)` inside `startShift()`
- Queue level events from `Kiln.Levels` into `Kiln.Narrative.queueEvent()` on shift start
- Call `Kiln.Production.addBrick()` when brick lifecycle auto-progresses to 'done'

### Layer 3 — Data Format Alignment (fix 2 bugs)
- Reconcile ending types: `calculateEnding()` → match `renderEnding()` keys
- Reconcile dialogue choices: flatten inline choice format to top-level `.choices`

### Layer 4 — Gameplay Completeness (fix 1 bug)
- Wire cooling zone: call `Kiln.Input.updateCooling(dt)` in updatePlaying loop
- Guard `activeBrick.quality` null check before comparison

## Execution Order

```
Patch 1: graceSystem.js     — expose addPoints() public method
Patch 2: workerSafety.js    — expose manager as Kiln.WorkerMgr after init
Patch 3: main.js            — wire initWorkers, queueEvents, addBrick, cooling, null guards
Patch 4: dialogues.js       — restructure choices to top-level .choices arrays
Patch 5: graceSystem.js     — align ending types with renderEnding()
```

## Success Criteria
- All 9 bugs resolved
- Phase 3 passes (game playable through at least Shift 1)
- No new files created; only edits to existing modules
