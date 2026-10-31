# Skills & Commands Guide (Cursor)

Quick reference for all available AI skills and commands in this project when using Cursor.

## Hierarchy

1. **Impeccable commands** — Primary for UI/UX refinement and quality
2. **Cursor rules** — Context loaded via `@` mentions
3. **ui-ux-pro-max** — Reference lookups (palettes, fonts, charts)

---

## UI/UX Refinement (Impeccable)

Use these commands to improve existing UI code. Reference `@teach-impeccable` once to set up project context.

| Command | Purpose | When to use |
|---------|---------|-------------|
| `@audit` | Comprehensive quality check (a11y, perf, responsive) | Before shipping, after major changes |
| `@critique` | UX design review (hierarchy, clarity) | Early design feedback |
| `@polish` | Final refinement pass | Right before release |
| `@simplify-design` | Remove unnecessary complexity | When UI feels cluttered |
| `@normalize` | Align with design system | Inconsistent styling |
| `@optimize` | Performance improvements | Slow interactions |
| `@harden` | Error handling, edge cases | Production readiness |
| `@clarify` | Improve UX copy and labels | Confusing text |
| `@animate` | Add purposeful motion | Static feels lifeless |
| `@colorize` | Add strategic color | Too monochromatic |
| `@bolder` | Amplify understated designs | Too subtle |
| `@quieter` | Tone down aggressive designs | Too loud |
| `@delight` | Add moments of joy | Functional but boring |
| `@extract` | Create reusable components | Repeated patterns |
| `@adapt` | Responsive design fixes | Mobile issues |
| `@onboard` | Design onboarding flows | First-time UX |

**Usage:** Reference the command file with `@`, e.g., `@audit review the navbar component`

---

## Cursor Rules (Context via @)

Reference these in Cursor with `@` for context:

| Rule | Purpose |
|------|---------|
| `@ui-design-guidelines` | UI/UX guidelines, accessibility, mobile responsiveness |
| `@coding-standards` | TypeScript, React, and code quality standards |
| `@project-context` | Project-specific context (customize this!) |

Project context can be filled by running **`@setup-project-context`** (optionally with a PRD path, e.g. `@setup-project-context use docs/prds/my-prd.md` to pre-fill). When you generate or share a first PRD, the PM agents may suggest this workflow. After you add or update research in `docs/research/` (e.g. `user-personas.md`, `pain-points-synthesis.md`), run **`@sync-research-to-context`** to update the User Personas (and optionally Key Terminology) section of project context from that research.

### Agent Rules

| Rule | Purpose |
|------|---------|
| `@engineer` | Technical feasibility and architecture |
| `@designer` | UX and design guidance |
| `@pm` | Product strategy and scope |
| `@executive` | Business and strategy |
| `@user-researcher` | User research and validation |

### Skill Rules

| Rule | Purpose |
|------|---------|
| `@pm-generate-prd` | PRD generation guidance |
| `@pm-clarify-prd` | PRD refinement Q&A |
| `@designer-prd-to-ux` | PRD to UX translation |
| `@ux-to-implementation-plan` | UX to implementation tasks |
| `@brand-identity` | Brand tokens and voice |

---

## Reference Lookups (ui-ux-pro-max)

Use the Python CLI for specific lookups when you need data, not guidance. Requires Python 3. Run from project root.

```bash
# Generate a complete design system
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system

# Look up specific palettes
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "healthcare" --domain color

# Look up font pairings
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "elegant luxury" --domain typography

# Look up chart types
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "comparison trends" --domain chart
```

**Note:** This is a reference database, not primary design guidance. Use impeccable commands for actual design decisions.

---

## Other Skills

| Skill | Purpose |
|-------|---------|
| **`/paper-sync`** | Sync an implemented screen into **Paper** from code (Paper MCP or paste mode). Full spec: `.cursor/skills/paper-sync/SKILL.md`. |
| `@vercel-react-best-practices` | React/Next.js performance patterns |
| `@frontend-design` | Primary design skill (auto-loaded for UI work) |

---

## Recommended Workflow

1. **Set project context (once):** Run `@setup-project-context` to capture product context via a short Q&A; optionally pass a PRD path (e.g. `@setup-project-context use docs/prds/my-prd.md`) to pre-fill. Suggested when you generate or share your first PRD.
2. **Starting a feature:** Use PRD pipeline rules (`@pm-generate-prd`, `@designer-prd-to-ux`, etc.)
3. **Quick question:** Reference agent rules (`@engineer`, `@designer`, `@pm`)
4. **Building UI:** `frontend-design` skill is auto-loaded
5. **Design ↔ code alignment:** After implementing a screen, **`/paper-sync`** pushes a code-faithful frame to Paper (or chunked HTML if MCP is off).
6. **Before shipping:** `@audit` → fix issues → `@polish`
7. **Need specific data:** Use ui-ux-pro-max CLI for lookups

---

## Claude Code vs Cursor

This project supports both Claude Code and Cursor. The skills are mirrored:

| Claude Code | Cursor |
|-------------|--------|
| `/audit` | `@audit` |
| `/setup-project-context` | `@setup-project-context` |
| `/sync-research-to-context` | `@sync-research-to-context` |
| `/paper-sync` | **`/paper-sync`** (see `.cursor/commands/paper-sync.md`) |
| `/designer` | `@designer` rule |
| `/pm-generate-prd` | `@pm-generate-prd` rule |

See [../.claude/SKILLS.md](../.claude/SKILLS.md) for the Claude Code version.
