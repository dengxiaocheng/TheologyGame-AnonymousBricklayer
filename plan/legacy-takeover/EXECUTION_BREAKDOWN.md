# Execution Breakdown — game7-anonymous-bricklayer

## Packet 1: Public API Stubs
**Files:** graceSystem.js, workerSafety.js
**Bugs fixed:** C1, C2
**Risk:** Low — additive only, no behavioral change

### graceSystem.js
```js
// Add after _addGracePoints definition (line ~101)
GraceSystem.prototype.addPoints = function (points, action, target) {
  this._addGracePoints(points, action, target);
};
```

### workerSafety.js
```js
// At end of initWorkers(), after manager is created:
Kiln.WorkerMgr = this.manager;
```

---

## Packet 2: Lifecycle Wiring
**File:** main.js
**Bugs fixed:** C3, C4, C5, C6, M1, M2
**Risk:** Medium — touches core game loop

### startShift() additions (~main.js line 380):
```js
// Init workers for this shift
if (Kiln.WorkerSafety) {
  Kiln.WorkerSafety.initWorkers(Kiln.State.currentShift);
}

// Queue level events
if (Kiln.Levels && Kiln.Narrative) {
  var shiftIdx = Kiln.State.currentShift - 1;
  var level = Kiln.Levels[shiftIdx];
  if (level && level.events) {
    level.events.forEach(function (evt) {
      Kiln.Narrative.queueEvent(evt);
    });
  }
}
```

### updatePlaying() additions:
```js
// After brick lifecycle update — count completed bricks
if (Kiln.BrickLifecycle) {
  var doneBricks = Kiln.BrickLifecycle.getDoneBricks();
  if (doneBricks.length > 0 && Kiln.Production) {
    doneBricks.forEach(function (b) {
      if (!b._counted) {
        Kiln.Production.addBrick(b.quality || 0.5);
        b._counted = true;
      }
    });
  }
}

// Apply cooling
if (Kiln.Input && Kiln.Input._cooling) {
  Kiln.Input.updateCooling(dt);
}

// Fix silence idle detection
var hasInput = Kiln.Input
  ? Object.keys(Kiln.Input.getActiveInputs()).length > 0
  : false;
// Pass hasInput to Kiln.Silence.update()
```

### Brick quality null guard (~main.js line 607):
```js
// Before: if (activeBrick.quality >= 0.7)
// After:
if (activeBrick.quality !== null && activeBrick.quality >= 0.7)
```

---

## Packet 3: Data Format Alignment
**Files:** dialogues.js, graceSystem.js
**Bugs fixed:** H1, H2
**Risk:** Medium — data restructuring

### dialogues.js
Restructure each scene from:
```js
{ lines: [ {speaker, text}, {speaker, text, choices: [...]} ] }
```
To:
```js
{ lines: [ {speaker, text}, {speaker, text} ], choices: [...] }
```
Extract any inline `.choices` from line objects to scene-level `.choices` array.

### graceSystem.js — calculateEnding()
Change return values from `['balanced', 'refuse_instrument', 'high_production']`
to `['guardian', 'witness', 'rebel', 'survivor']` matching renderEnding() keys:
- compassion≥60 && courage≥60 → 'guardian'
- courage≥60 → 'rebel'
- compassion≥60 → 'witness'
- default → 'survivor'

---

## Execution Order
1. **Packet 1** first — no dependencies, unblocks accident/worker systems
2. **Packet 2** second — depends on Packet 1 APIs existing, wires game loop
3. **Packet 3** last — depends on game loop being functional for testing

## Estimated Changes
| File | Lines Changed |
|------|--------------|
| graceSystem.js | ~15 |
| workerSafety.js | ~2 |
| main.js | ~30 |
| dialogues.js | ~20 |
| **Total** | **~67** |

Well within 500-line budget.
