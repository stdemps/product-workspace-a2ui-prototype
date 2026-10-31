# Skills & Commands Guide

Quick reference for all available AI skills and commands in this project.

## Hierarchy

1. **Impeccable commands** — Primary for UI/UX refinement and quality
2. **Original agents** — Conversational help and PRD pipeline
3. **ui-ux-pro-max** — Reference lookups (palettes, fonts, charts)

---

## UI/UX Refinement (Impeccable)

Use these commands to improve existing UI code. Run `/teach-impeccable` once to set up project context.

| Command | Purpose | When to use |
|---------|---------|-------------|
| `/audit` | Comprehensive quality check (a11y, perf, responsive) | Before shipping, after major changes |
| `/critique` | UX design review (hierarchy, clarity) | Early design feedback |
| `/polish` | Final refinement pass | Right before release |
| `/simplify-design` | Remove unnecessary complexity | When UI feels cluttered |
| `/normalize` | Align with design system | Inconsistent styling |
| `/optimize` | Performance improvements | Slow interactions |
| `/harden` | Error handling, edge cases | Production readiness |
| `/clarify` | Improve UX copy and labels | Confusing text |
| `/animate` | Add purposeful motion | Static feels lifeless |
| `/colorize` | Add strategic color | Too monochromatic |
| `/bolder` | Amplify understated designs | Too subtle |
| `/quieter` | Tone down aggressive designs | Too loud |
| `/delight` | Add moments of joy | Functional but boring |
| `/extract` | Create reusable components | Repeated patterns |
| `/adapt` | Responsive design fixes | Mobile issues |
| `/onboard` | Design onboarding flows | First-time UX |

**Tip:** Most commands accept an optional argument to focus on a specific area, e.g., `/audit navbar`

---

## Conversational Agents

Use these for quick questions and the PRD pipeline workflow.

| Agent | Purpose | Example |
|-------|---------|---------|
| `/engineer` | Technical questions, architecture | "How should I structure auth?" |
| `/designer` | UX questions, accessibility | "Best mobile nav pattern?" |
| `/pm` | Product strategy, scope | "Should we include this feature?" |
| `/executive` | Business cases, prioritization | "How do I pitch this to stakeholders?" |
| `/user-researcher` | User validation, research | "How do I test this assumption?" |

---

## Project Context

Capture product context (goals, personas, philosophy, priorities) so the AI has it every session. Run **`/setup-project-context`** to answer a short Q&A; optionally pass a PRD path to pre-fill (e.g. `/setup-project-context docs/prds/my-prd.md`). Writes to `.cursor/rules/project-context.mdc` (shared with Cursor). When you generate or share a first PRD, the PM skills may suggest this workflow. After you add or update research in `docs/research/` (e.g. `user-personas.md`, `pain-points-synthesis.md`), run **`/sync-research-to-context`** to update the User Personas (and optionally Key Terminology) section of project context from that research.

---

## PRD Pipeline Skills

For turning ideas into buildable specs.

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `/pm-generate-prd` | Create PRD from idea | Idea → `docs/prds/feature.md` |
| `/pm-clarify-prd` | Refine PRD with Q&A | PRD → Refined PRD |
| `/designer-prd-to-ux` | Translate PRD to UX spec | PRD → `feature-ux-spec.md` |
| `/ux-to-implementation-plan` | Create implementation plan | UX spec → Task list |
| `/designer-brand-identity` | Brand tokens and voice | — → Design tokens |

---

## Reference Lookups (ui-ux-pro-max)

Use the Python CLI for specific lookups when you need data, not guidance.

```bash
# Generate a complete design system
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system

# Look up specific palettes
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "healthcare" --domain color

# Look up font pairings
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "elegant luxury" --domain typography

# Look up chart types
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "comparison trends" --domain chart
```

**Note:** This is a reference database, not primary design guidance. Use impeccable commands for actual design decisions.

---

## Other Skills

| Skill | Purpose |
|-------|---------|
| `/paper-sync` | Sync an implemented screen into **Paper** from code (Paper MCP or paste mode). Spec: `.claude/skills/paper-sync/SKILL.md` (mirror: `.cursor/skills/paper-sync/`). |
| `/vercel-react-best-practices` | React/Next.js performance patterns |
| `/agentation` | Add visual feedback toolbar |

---

## Recommended Workflow

1. **Set project context (once):** Run `/setup-project-context` to capture product context via Q&A; optionally pass a PRD path (e.g. `/setup-project-context docs/prds/my-prd.md`) to pre-fill. Suggested when you generate or share your first PRD.
2. **Starting a feature:** `/pm-generate-prd` → `/designer-prd-to-ux` → `/ux-to-implementation-plan`
3. **Quick question:** `/engineer`, `/designer`, or `/pm`
4. **Building UI:** Use `frontend-design` skill (auto-loaded)
5. **Design ↔ code alignment:** After implementing a screen, **`/paper-sync`** pushes a code-faithful frame to Paper (or chunked HTML if MCP is off).
6. **Before shipping:** `/audit` → fix issues → `/polish`
7. **Need specific data:** Use ui-ux-pro-max CLI for lookups
