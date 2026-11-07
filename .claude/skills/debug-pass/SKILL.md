---
name: debug-pass
description: Run a full debug and streamline pass on any codebase - a game, web app, CLI, server, library or script. Maps the project, runs its own checks, adds static checks, then exercises every reachable feature (headless when it has a UI) to find crashes, stalls, state leaks, dead code and docs drift, and fixes what it finds on one branch. Use when the user asks for a "debug pass", "run-through", "smoke test", "debug and streamline", "check everything for bugs" or "clean this up".
---

# Debug Pass

A broad, token-light sweep of a project: find what is broken or rotting, fix it on one branch, report in a few lines. Works for any language or project type; pick the recipe that fits in step 3.

**Before anything else, read `LESSONS.md` in this folder and apply every lesson.** Lessons override the defaults below.

## 1. Map the project (read little)

Grep and list; don't read whole files. Find:
- **Type and stack**: game, web app, CLI, server/API, library, script, data pipeline. Language, framework, build tool.
- **The repo's own checks**: lint, format, typecheck, tests, build: from package.json scripts, Makefile, CI config, pyproject, Cargo.toml, etc. The repo's CLAUDE.md or contributing notes win over anything here.
- **Entry points**: main, routes, commands, screens, game modes, public API.
- **Every feature you can reach cheaply**: menus, debug/dev panels, CLI subcommands, API routes, exported functions, fixtures. Dev or debug menus are the fastest way into deep content (bosses, levels, admin states).
- **State that persists**: localStorage, files, databases, caches, config. Where it's written, read and reset.

## 2. Static checks

1. Run the repo's own lint, typecheck, tests and build. Note what was already failing before you touched anything.
2. Syntax-check anything those don't cover (e.g. inline `<script>` blocks: extract, then `node --check`).
3. Duplicate definitions: top-level names, element ids, route paths, CLI flags, config keys.
4. Dead code: symbols defined but never referenced (grep each; ignore ones used via strings, reflection or spreads).
5. Persisted state: every key/file/table written vs. what any reset, migration or cleanup touches. Missing ones are bugs.
6. Docs drift: README, help text, in-app guides, credits and changelogs vs. what the code now does, especially anything the repo's CLAUDE.md says to keep current.

## 3. Run-through (exercise everything)

Use the recipe for the project type. Long runs go **in the background** (`run_in_background`); keep working or report progress meanwhile.

- **Browser app or game**: fill in `recipes/browser-harness.js` and run it with Playwright. It loads the page, plays every listed run (modes, characters, levels), every option of each dev-menu selector, and every screen, then reports page errors, console errors, per-run exceptions and where each run ended. For anything with a frame loop it fast-forwards the loop (see Harness rules).
- **CLI**: run every subcommand with `--help`, typical args, missing/invalid args, empty and large input, and piped stdin. Check exit codes and stderr.
- **Server/API**: start it, hit every route (happy path, bad input, missing auth, unknown id), and watch the log for stack traces. Stop the server afterwards.
- **Library**: run the tests, then a scratch script that calls each public function with edge inputs (empty, null, huge, unicode, wrong types).
- **Script or pipeline**: run it on a small real input and an empty or malformed one, in a temp dir.

Never run deploy, release, publish or destructive steps. Use scratch copies of data.

### Harness rules (learned the hard way)
- **An empty error list proves nothing** until progress output shows the runs actually advanced. Check coverage first: count what ran vs. what exists.
- **Lazy menus**: some lists only populate when their screen opens. Open it, wait, then count.
- **Simulate, don't wait** (frame-loop apps): stub the render call and `requestAnimationFrame`, then call the loop with a fake clock in 50 ms steps. Headless WebGL is about 3 fps.
- **Chunk the sim**: 5 simulated seconds, then about 400 ms of real time, so `setTimeout` transitions still fire.
- **Reset the clock after each chunk** (e.g. `last=performance.now()`), or the real loop sees a negative frame time and runs timers backwards.
- **Auto-answer choices**: when play pauses on a choice, click a random visible enabled button.
- **Keep it offline**: route CDN scripts to local copies.

## 4. Fix and streamline

- One branch (e.g. `debug-pass`). Fix real bugs first. Then safe cleanups: dead code, duplicated logic, missed reset/cleanup keys, stale docs.
- Don't rebalance, redesign or change behaviour the user chose; list those as suggestions.
- Re-run the checks and the part of the run-through that covers each fix.
- Follow the repo's own workflow for commits, PRs and merging (its CLAUDE.md or session instructions win).

## 5. Report

A few short lines: what was covered (and what wasn't), bugs fixed, anything suspicious but unconfirmed, suggestions. No logs unless asked.

## 6. Learning (keep LESSONS.md small)

When the user corrects this skill or states a lasting preference ("always…", "never…", "next time…"), save it to `LESSONS.md` **without asking for approval**:

1. Find an existing lesson on the same point. Replace or merge it instead of adding a duplicate; a newer preference overrides an older one.
2. File it under the right heading (Mapping, Static checks, Run-through, Fixing, Reporting, Other), one short line, dated `YYYY-MM-DD`.
3. Keep the file under 40 lessons. When it reaches that, tidy it: remove stale lessons, combine similar ones.
4. **Promote**: when a lesson has held for 3+ passes, or the user says to make it permanent, fold it into this SKILL.md (or a recipe) and delete it from LESSONS.md.
5. Commit and push to `main` of the SkillHub repo right away, message `lesson: <what changed>`. Tell the user in one line: "Saved lesson: … (say *undo lesson* to revert)".
6. If the user says **undo lesson**, `git revert` the most recent `lesson:` commit and push.

Also save a lesson, without being asked, when a pass teaches something general the hard way (a harness trick, a false-clean result, a check that caught a real bug), so the next pass on any project starts smarter.

One-off requests for a single project ("skip the zone tests here") are not lessons. When unsure, apply the change and ask in one line whether to keep it for every pass.
