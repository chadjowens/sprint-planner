# SuperSymm Process Improvement System: How It Works

This Sprint Planner is not a standalone tool. It is the visual layer of a three-part process improvement system designed to keep documentation, architecture, and execution perfectly aligned.

The three parts of the system are:
1. **Graphify** (Structural Memory)
2. **Claude-Obsidian** (Episodic Memory)
3. **Sprint Planner** (Execution View)

---

## 1. Graphify (Structural Memory)

Graphify builds an AST-based knowledge graph of the `biz-automation-dashboard` codebase. It answers questions like *"What calls this function?"* and *"If I change this file, what breaks?"*

**Where it lives:**
- Installed via `uv` in the sandbox environment.
- Configured via the `.claude/skills/graphify` skill.
- Output artifacts live in `graphify-out/` (gitignored).

**How it works:**
When you run `graphify update .` in the repo root, it parses the entire codebase locally (no code leaves the machine) and generates a graph of all nodes and edges. The Sprint Planner (via the Context Doc Viewer) surfaces this data so you can see architectural dependencies while planning a sprint.

---

## 2. Claude-Obsidian (Episodic Memory)

The `wiki/` directory is the single source of truth for architectural decisions, sprint history, and rejected approaches. It is formatted as an Obsidian vault.

**Where it lives:**
- The `wiki/` directory inside `biz-automation-dashboard`.
- Indexed by `wiki/index.md` and summarized in `wiki/hot.md`.

**How it works:**
The wiki captures *why* things were built a certain way. The `wiki/decisions/` folder holds Architecture Decision Records. The `wiki/rejected/` folder prevents future agents from re-exploring dead ends. The Sprint Planner surfaces these docs inline so context is available without leaving the board.

---

## 3. Sprint Planner (Execution View)

This board is a **read-only view** of the repository's state. It is not a database.

**Where it lives:**
- The `sprint-planner` repository.
- Fed by `public/sprints.json`.

**How it works:**
1. **The Manifest:** The `pnpm build:manifest` script in `biz-automation-dashboard` reads all the markdown files in `docs/sprints/` and generates `sprints.json`.
2. **The Board:** This UI imports that manifest. If you want to change a priority, edit a description, or move an item, you do not click and drag here. You edit the markdown file in the repository.
3. **The Status:** The `backlog-status-<slug>.sh` script watches the git log. When a commit lands with a sprint tag (e.g., `[SP1-2]`), the status flips to done.

---

## The Sprint Lifecycle

1. **Setup:** Run `./scripts/sprint-setup.sh <slug>` to provision branches and worktrees.
2. **Plan:** Build the manifest (`pnpm build:manifest`). Use the Context Viewer to read Graphify and Wiki docs.
3. **Execute:** Claude Code writes the code. The board updates as commits land.
4. **QA:** Press `q` to open the Quick Capture panel. Findings are written directly to `docs/backlog/_inbox/` with a `site_area` tag.
5. **Close:** Click "Close sprint →" to reveal the 10-step checklist (Graphify rebuild, Obsidian sync, worktree cleanup).
