# SkillHub
Skills for AI.

## Skills

| Skill | What it does | Use it |
|---|---|---|
| [game-blueprint](.claude/skills/game-blueprint/SKILL.md) | Interviews you about a game, then publishes a themed Blueprint artifact: a Build Log (Game Overview, Key Features, First Playable), saved notes for Claude, and three filterable placeholder tabs with add/edit forms. Learns your preferences in `LESSONS.md`. | `/game-blueprint` or "make a blueprint for my new game" |
| [game-debug-pass](.claude/skills/game-debug-pass/SKILL.md) | Debug and streamline pass for a browser game: static checks (syntax, duplicates, dead code, storage keys, docs drift) plus a headless Playwright run-through of every mode, character, boss, event and screen at high speed. Fixes what it finds on one branch. | `/game-debug-pass` or "do a debug pass" |

## Using these skills

Skills in `.claude/skills/` load when this repo is part of the Claude Code session. To use them while working on another repo (a game), attach SkillHub to that session too.

Lessons are committed automatically as `lesson: …` commits. Say **undo lesson** to revert the latest one, or revert any of them in git.
