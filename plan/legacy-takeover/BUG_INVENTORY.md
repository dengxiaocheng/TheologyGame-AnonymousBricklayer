# Bug Inventory — game7-anonymous-bricklayer

## CRITICAL (blocks gameplay)

### C1: Grace.addPoints() called but doesn't exist
- **Callers:** accidentSystem.js:126-128, 177-179, 226-228; workerSafety.js:127
- **Symptom:** TypeError on accident/choice — grace never recorded
- **Fix:** Add public `addPoints(pts, action)` method to graceSystem.js delegating to `_addGracePoints`

### C2: Kiln.WorkerMgr referenced but doesn't exist
- **Callers:** accidentSystem.js:222-224, 256-257 (modifyTrust, heal, injure)
- **Symptom:** TypeError — accident consequences never applied
- **Fix:** After `initWorkers()` runs, set `Kiln.WorkerMgr = Kiln.WorkerSafety.manager`

### C3: Workers never initialized
- **Callers:** Nothing calls `Kiln.WorkerSafety.initWorkers()`
- **Symptom:** `Kiln.WorkerSafety.manager` is null, all worker operations fail silently
- **Fix:** Call `initWorkers(shiftNum)` in `startShift()` within main.js

### C4: Level events never queued into narrative engine
- **Callers:** Nothing bridges `Kiln.Levels[i].events[]` → `Kiln.Narrative.queueEvent()`
- **Symptom:** No dialogue or story events ever fire — silent shifts
- **Fix:** On shift start, iterate current level's events array and queue each

### C5: Production.addBrick() never called
- **Callers:** Nothing calls it when bricks reach 'done' state
- **Symptom:** Shift always shows 0/N completed, towerProgress stuck at 0
- **Fix:** In brickLifecycle.autoProgress() callback or main.js update loop, call `Kiln.Production.addBrick(quality)`

### C6: Cooling zone input never applied
- **Callers:** Input handler sets `_cooling=true` but updatePlaying never calls updateCooling(dt)
- **Symptom:** Holding cooling zone does nothing — bricks can't be cooled
- **Fix:** Add `Kiln.Input.updateCooling(dt)` call in updatePlaying loop

## HIGH (breaks specific features)

### H1: Ending type mismatch
- **Source:** graceSystem.calculateEnding() returns: 'balanced', 'refuse_instrument', 'high_production'
- **Consumer:** main.js renderEnding() maps: 'guardian', 'witness', 'rebel', 'survivor', 'unknown'
- **Symptom:** Ending always renders as 'unknown' fallback text
- **Fix:** Align calculateEnding() to return the same keys renderEnding() expects

### H2: Dialogue choices format mismatch
- **Source:** dialogues.js embeds choices inline within line arrays (as objects with `.choices`)
- **Consumer:** narrativeEngine._startChoice() expects `Kiln.Dialogues.scenes[key].choices` at top level
- **Symptom:** Choices never render — dialogue plays but no decisions shown
- **Fix:** Restructure dialogues.js scenes to have top-level `.choices` arrays

## MODERATE (degraded experience)

### M1: getActiveInputs() return type
- **Source:** main.js:484 — `!Kiln.Input.getActiveInputs()` — object is always truthy
- **Symptom:** Silence system always sees "has input" — idle observations never trigger
- **Fix:** Check `Object.keys(inputs).length === 0` or add isEmpty() helper

### M2: Brick quality null before done state
- **Source:** main.js:607 — `activeBrick.quality >= 0.7` when quality is null
- **Symptom:** TypeError crash when rendering active (non-done) brick quality indicator
- **Fix:** Add null guard: `(activeBrick.quality !== null && activeBrick.quality >= 0.7)`
