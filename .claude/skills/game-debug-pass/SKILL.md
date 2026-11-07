---
name: game-debug-pass
description: Run a full debug and streamline pass on a browser game (single-file HTML/JS, e.g. Three.js or canvas). Static checks plus a headless Playwright run-through that plays every mode, character, boss, event and screen at high speed and reports errors, stalls and dead code, then fixes what it finds. Use when the user asks for a "debug pass", "run-through", "smoke test", "debug and streamline", or to check the whole game for bugs.
---

# Game Debug Pass

A fast, token-light sweep of a web game: find crashes, stalls, state leaks and drift, fix them on one branch, report in a few lines.

**Before anything else, read `LESSONS.md` in this folder and apply every lesson.** Lessons override the defaults below.

## 1. Map the game (read little)

Grep, don't read whole files. Find:
- **Main loop**: the function passed to `requestAnimationFrame`, its time variable (e.g. `let last`), and the render call (e.g. `R.render(S,C)`).
- **Run state and entities**: the state object (e.g. `st`), enemy list, shot list, the `hp` field and where `hp<=0` is handled.
- **Entry points**: start function and its args (modes, characters), wave/level function, menu/back function, screen switcher (e.g. `show(id)`).
- **Choice overlays** that pause play (upgrade picks, routes, events) and their button containers.
- **Dev/debug menu** lists (boss, event, zone selectors). These are the cheapest way to reach every boss and event.
- **Invincibility flag** if one exists; otherwise patch the hurt function in the harness.

## 2. Static checks

Extract the game's script and run each:
1. `node --check` on the extracted script.
2. Duplicate top-level `function`/`const`/`let` names, and duplicate element `id`s.
3. Symbols defined but never referenced (dead code). Ignore names used only through spreads or string keys after a quick grep.
4. Storage keys: every `localStorage` key used vs. the keys any "reset progress" / wipe code removes. Missing ones are bugs.
5. Docs drift: features, bosses and modes added recently vs. the How to Play, credits and log screens the repo's CLAUDE.md says to keep current.

## 3. Headless run-through

Copy `harness.js` to the scratchpad, fill in its `CFG` block from step 1, and run it **in the background** (it can take several minutes; never block the user's phone session on it):

```
S=<scratchpad> node harness.js > run.out 2>&1   # run_in_background
```

The harness plays:
- every mode x character for N simulated seconds with invincibility, chipping enemy hp so waves clear;
- every dev-menu boss (reports whether it died) and event;
- every zone at early/mid/late sectors;
- every screen opened from the menu.

It reports page errors, console errors, per-tick exceptions with the first stack line, and where each run ended (level, area, visible overlays) so stalls show up.

### Harness rules (learned the hard way)
- **Simulate, don't wait**: stub the render call and `requestAnimationFrame`, then call the loop function with a fake clock in 50 ms steps. Headless WebGL (swiftshader) runs about 3 fps, so real-time play is far too slow.
- **Chunk the sim**: 5 simulated seconds, then about 400 ms of real time, so `setTimeout`-driven transitions and fades still fire.
- **Reset the clock after each chunk** (`last=performance.now()`), or the real loop sees a negative frame time and runs timers backwards.
- **Auto-pick choices** while not running: click a random visible, enabled button in the choice containers every 20 ticks.
- Route CDN scripts to a local copy (`page.route`) so the page loads offline.
- An empty error list proves nothing until a progress line shows runs actually advanced. Check that first.

## 4. Fix and streamline

- One branch (e.g. `debug-pass`). Fix real bugs first, then safe cleanups: dead code, duplicated logic, missing storage keys, stale docs. Don't rebalance or redesign; list those as suggestions.
- Re-run the syntax check, and the harness section that touched the change.
- Follow the repo's own workflow for commits, PRs and merging (its CLAUDE.md or session instructions win).

## 5. Report

A few short lines: what was tested, bugs fixed, anything suspicious but unconfirmed, suggestions. No logs unless asked.

## 6. Learning (keep LESSONS.md small)

When the user corrects this skill or states a lasting preference, save it to `LESSONS.md` without asking: merge with an existing lesson on the same point, one dated line under the right heading, under 40 lessons. Promote lessons that have held for 3+ passes into this file. Commit and push to SkillHub `main` as `lesson: <what changed>`, and tell the user in one line ("Saved lesson: … (say *undo lesson* to revert)"). On **undo lesson**, `git revert` the latest `lesson:` commit and push.
