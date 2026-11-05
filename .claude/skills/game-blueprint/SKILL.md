---
name: game-blueprint
description: Interview the user about a game idea, then publish a "<Game> Blueprint" artifact - a themed, saved roadmap page with a Build Log (Game Overview, Key Features, First Playable cards), notes for Claude, and placeholder tabs with add/edit forms. Use when the user wants a blueprint, roadmap, design plan or build plan for a game they want to make, or says "make a blueprint for <game>".
---

# Game Blueprint

Builds a Blueprint artifact for any game. The page is the shared plan: the user ticks items, leaves notes and adds entries; Claude reads them before coding each piece.

**Before anything else, read `LESSONS.md` in this folder and apply every lesson.** Lessons override the defaults below.

## 1. Interview first

Never build before the interview. Ask these together in one message (use AskUserQuestion when it's available, otherwise plain text), then follow up only on gaps:

1. **Game name** (working title is fine).
2. **Genre(s)**: e.g. farm sim, roguelite shooter, puzzle, platformer. More than one is fine.
3. **Theme**: the look, mood and setting (e.g. "cozy pixel meadow", "neon cyberpunk", "storybook watercolor").
   If the user skips it: use the game's current theme (look in the game's repo or an existing artifact for its colors, fonts and art style). If there is no game yet, pick one that fits the genre and say which.
4. **Core loop**: what the player does over and over, in one sentence (e.g. "plant, water, sleep, harvest, sell").
5. **Three key features**: what makes this game itself. If the user offers fewer, propose the rest and mark them as suggestions.

Then show a short summary (name, genre, theme, loop, 3 features, the First Playable list from step 2) and build once the user confirms or says go.

## 2. Fill the template

Copy `template.html` to the scratchpad as `<game-slug>-blueprint.html` and replace every `{{...}}` placeholder. Leave no placeholder behind (`grep '{{'` must return nothing).

| Placeholder | Fill with |
|---|---|
| `{{GAME}}` | Game name (appears in `<title>` and `<h1>`) |
| `{{GENRE}}`, `{{THEME}}`, `{{CORE_LOOP}}` | Interview answers, one short line each |
| `{{FEATURE_1..3}}` | The three key features, each one line, concrete and buildable |
| `{{PLAY_START}}` | How the game starts (title screen / "Press to start") |
| `{{PLAY_CONTROLS}}` | The game's actual controls doing the core action |
| `{{PLAY_LOOP}}` | The core loop running at least once: act → result → act again, in this game's terms |
| `{{PLAY_END}}` | A simple win or lose condition for this game |
| `{{PLAY_HUD}}` | The one readout that shows progress (score, timer, health, turn, day…) |

The First Playable card must describe the **smallest** game someone can start, play, finish and replay. Keep it simple; depth goes in later cards.

**Theme:** edit only the block between `THEME` and `END THEME`, plus the Google Fonts `<link>`.
- Set every color token for light mode, and for dark mode in both dark blocks. Keep text readable (contrast ≥ 4.5:1) in both.
- `--pattern` can be a CSS background (gradients) that suits the theme, kept subtle. A single dark look is fine if the theme demands it (e.g. space); then set `color-scheme:dark` on `:root` and drop the light values.
- Fonts: one display font, one body font, from Google Fonts.
- Change no layout or behavior outside the theme block.

**Fixed rules (don't change unless a lesson says so):**
- Build Log cards start collapsed (no `open` attribute).
- Interview answers start ticked: the Game Overview boxes (Genre, Theme, Core loop) ship with `checked` in the template, since the user already answered them. Remove `checked` from any box whose question the user didn't answer (e.g. you picked the theme for them). Ticked boxes stay editable: the user can untick them, and saved checks override the defaults.
- A card whose boxes are all ticked turns gray but stays readable and clickable (`details.done`).
- Card order: 1 Game Overview, 2 Key Features, 3 First Playable. New cards are added later, numbered 4, 5…, by request, from notes, or automatically (Expanding the Game, see section 4).
- Exactly two other tabs, **Tab 1** and **Tab 2**, start empty with the shared placeholder text and the add/edit form.
- No ideas/parking card and no playable demo widget.

## 3. Publish

Publish with the Artifact tool: the filled file, `icon: "game"`, `capabilities: {"db": {}, "user": {}}`, and a one-sentence description. Notes and checks save to `sections/<card id>`; tab entries save to the `tab1` / `tab2` collections. Give the user the link.

## 4. Later changes to a blueprint

- Before coding any piece of the game, read the blueprint's saved data with `ArtifactData` (`sections`, `tab1`, `tab2`, and any added collections) and follow the notes.
- **Expanding the Game card:** whenever you read the saved data and every box in cards 1–3 is ticked (`sections/overview`, `sections/features`, `sections/playable`), and no such card exists yet, add card 4 **Expanding the Game** (`data-id="expand"`, why: "growing what we have"). Give it exactly 5 checklist items that tack onto what has actually been built: read the game's code and the blueprint's notes and entries first, so each item extends an existing system (a new tier, more content, a reward loop, an upgrade) rather than starting a new one. One line each, concrete and buildable. Tell the user the card was added.
- **New card:** append a numbered `<details data-id="...">` in the marked spot, same structure, collapsed.
- **Rename or repurpose a tab:** change the tab button text and its form fields; keep its `data-coll`, or move its entries to the new collection with `ArtifactData`.
- **New tab:** add a tab button and a `<section class="pane" ... data-coll="<name>">`; the script builds its list and form.
- Republish to the same artifact URL, never a new one.

## 5. Learning (keep LESSONS.md small)

When the user corrects the skill or states a lasting preference ("always…", "never…", "next time…"), save it to `LESSONS.md` **without asking for approval**:

1. Find an existing lesson on the same point. Replace or merge it instead of adding a duplicate; a newer preference overrides an older one.
2. File it under the right heading (Interview, Cards, Tabs, Theme, Wording, Other), one short line, dated `YYYY-MM-DD`.
3. Keep the file under 40 lessons. When it reaches that, tidy it: remove stale lessons, combine similar ones.
4. **Promote**: when a lesson has held for 3+ blueprints, or the user says to make it permanent, fold it into this SKILL.md (or `template.html`) and delete it from LESSONS.md.
5. Commit and push to `main` of the SkillHub repo right away, message `lesson: <what changed>`. Tell the user in one line: "Saved lesson: …(say *undo lesson* to revert)".
6. If the user says **undo lesson**, `git revert` the most recent `lesson:` commit and push.

One-off requests for a single game ("make this one purple") are not lessons. When unsure, apply the change and ask in one line whether to keep it for every blueprint.

If the SkillHub repo isn't in the session (the skill was copied elsewhere), say so and give the lesson text for the user to add later instead of committing.
