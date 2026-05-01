# Risk Register — game7-anonymous-bricklayer

## R1: Dialogue Restructuring Scope (MEDIUM)
**Risk:** dialogues.js has ~30 scenes. Inline choices may be inconsistent in format.
**Impact:** If choices are embedded differently per scene, restructuring could miss cases → silent failures.
**Mitigation:** Audit all scenes before patching. Use grep for `.choices` across dialogue objects.
**Decision needed:** None — standard audit.

## R2: WorkerMgr Alias Timing (LOW)
**Risk:** `Kiln.WorkerMgr = this.manager` is set in initWorkers(). If accidentSystem fires before initWorkers completes, Kiln.WorkerMgr is undefined.
**Impact:** Accident consequences crash instead of applying gracefully.
**Mitigation:** initWorkers is called at shift start, accidents fire mid-shift. Order is guaranteed by game loop.
**Decision needed:** None — timing is safe.

## R3: Brick Counting Double-Count (MEDIUM)
**Risk:** Using `b._counted` flag to prevent double-counting done bricks. If getDoneBricks() returns bricks from prior shifts, they'd already be counted.
**Impact:** Production count could overflow if not reset between shifts.
**Mitigation:** BrickLifecycle.initBatch() creates fresh batch each shift. getDoneBricks() only returns current batch.
**Decision needed:** None — but verify initBatch resets state.

## R4: Ending Type Semantic Alignment (LOW)
**Risk:** Changing ending type strings affects both calculateEnding() and any future logic depending on those strings.
**Impact:** Minimal — ending types are only consumed by renderEnding() in main.js.
**Mitigation:** Grep for ending type strings across all files before changing.
**Decision needed:** None.

## R5: Phase 3 Orchestrator Test Compatibility (HIGH)
**Risk:** The orchestrator failed Phase 3 twice. We don't know exact test criteria. Fixes may not align with what Phase 3 validates.
**Impact:** Fixes could be correct but still not pass orchestrator's specific assertions.
**Mitigation:** Check orchestrator logs for assertion messages. If unavailable, focus on making Shift 1 fully playable: start → kiln interaction → brick completion → shift end.
**Decision needed:** Manager should provide Phase 3 test criteria or orchestrator log output.

## R6: Cooling Implementation Completeness (LOW)
**Risk:** Input handler has `updateCooling` referenced but may not be fully implemented.
**Impact:** Wiring the call may expose that the method body is incomplete.
**Mitigation:** Read inputHandler.js updateCooling method before wiring. If stub, implement basic cooling (reduce temperature).
**Decision needed:** None — read and verify first.
