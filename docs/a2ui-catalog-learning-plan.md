# A2UI Catalog Learning Plan

Hands-on curriculum for understanding how to define and extend an A2UI catalog in this prototype. Use this after the basic chat + canvas flow is working at `/prototype`.

**Related docs:** [a2ui-agui-research.md](./a2ui-agui-research.md) · [README-A2UI-PROTOTYPE.md](../README-A2UI-PROTOTYPE.md)

---

## Current baseline

| Layer | Status | Key files |
|-------|--------|-----------|
| Chat + Gemini streaming | Working | `components/prototype/chat-panel.tsx`, `lib/agent/llm-agent.ts` |
| Canvas rendering | Working | `components/prototype/a2ui-canvas-panel.tsx` |
| shadcn catalog (10 components) | In place | `lib/a2ui/catalog/*` |
| LLM catalog contract | In place | `lib/agent/catalog-spec.ts` |
| Message normalization + fallbacks | In place | `lib/agent/normalize-a2ui-messages.ts` |

**Catalog components today:** `Text`, `Row`, `Column`, `List`, `Card`, `Divider`, `Button`, `TextField`, `CheckBox`, `Tabs`

**Learning focus:** how catalogs work — not plumbing. You should be able to add a component and reuse the pattern in another project.

---

## Core mental model

```
Agent JSON  →  catalog contract  →  React renderer  →  canvas
(declarative)     (Zod + spec)         (shadcn/ui)        (A2uiSurface)
```

The **catalog** is the contract between what the agent sends and what your app renders:

1. **What components can the agent request?** (registered names)
2. **What props does each accept?** (Zod schemas — the agent's API)
3. **How does each map to your UI?** (React implementations)

Your app never executes agent code. It only renders components you have registered.

---

## Session plan (~60–90 minutes)

### 1. Orient (10 min)

Open [http://localhost:3000/prototype](http://localhost:3000/prototype) and send a starter prompt. While it runs, skim these files **in order**:

| # | File | What to look for |
|---|------|------------------|
| 1 | `lib/a2ui/catalog/shadcn-catalog.ts` | How components are registered on the `Catalog` |
| 2 | `lib/a2ui/catalog/shadcn-components.tsx` | Renderer implementations (start with `Text`, then `Button`) |
| 3 | `lib/a2ui/sample-messages.ts` | Example agent payloads (flat component list) |
| 4 | `components/prototype/a2ui-canvas-panel.tsx` | `MessageProcessor` + `A2uiSurface` |
| 5 | `lib/agent/catalog-spec.ts` | What the LLM is allowed to generate |

**Question to answer:** What happens between the AG-UI `CUSTOM` event (`a2ui.messages`) and pixels on screen?

---

### 2. Trace one component end-to-end (15 min)

Pick **`Button`** and follow the full path:

| Step | Location | Notes |
|------|----------|-------|
| Schema / API | `shadcn-catalog.ts` + `shadcn-components.tsx` | Props the catalog declares |
| Renderer | `shadcn-components.tsx` | Maps to `@/components/ui/button` |
| Agent message | `sample-messages.ts` or live SSE output | Flat list entry; label is a separate `Text` child |
| User interaction | `a2ui-canvas-panel.tsx` → `app/prototype/page.tsx` | Click → `onAction` → chat prompt `Canvas action: …` |

Repeat briefly for **`TextField`** to see data binding via `{ path: "/…" }` and `updateDataModel`.

---

### 3. Hands-on exercise: add `Badge` (30–45 min)

Main exercise — small scope, full pattern.

#### Checklist

- [ ] Add `Badge` renderer in `lib/a2ui/catalog/shadcn-components.tsx` (map to `@/components/ui/badge`)
- [ ] Register `Badge` in `lib/a2ui/catalog/shadcn-catalog.ts`
- [ ] Add `Badge` to `ALLOWED_COMPONENTS` in `lib/agent/normalize-a2ui-messages.ts`
- [ ] Document props in `lib/agent/catalog-spec.ts` (what the LLM may emit)
- [ ] Test on `/prototype`

#### Suggested props for `Badge`

| Prop | Type | Notes |
|------|------|-------|
| `text` | `string` or `{ path }` | Label content |
| `variant` | `default` \| `secondary` \| `destructive` \| `outline` | Match shadcn variants |

#### Test prompt

> Show a budget card with status badges for Approved, Pending, and Rejected

**Done when:** badges render on the canvas and Gemini (or mock fallback) uses the new component type.

---

### 4. Break the system on purpose (10 min)

Build intuition for the contract and guardrails:

| Experiment | What you learn |
|------------|----------------|
| Ask for a non-catalog component (e.g. `ProgressBar`) | Unknown types are rejected or fall back |
| Inspect malformed LLM output (`type` vs `component`) | Role of `normalize-a2ui-messages.ts` |
| Temporarily remove a component from `catalog-spec.ts` | LLM vs client validation |

When something fails, check server logs and `lib/agent/normalize-a2ui-messages.ts` first.

---

### 5. Reflect: porting to another project (10 min)

Checklist for reusing this pattern elsewhere:

1. **Catalog ID** — stable URI in `constants.ts`
2. **Renderers** — map catalog primitives to your design system (shadcn, MUI, etc.)
3. **Catalog assembly** — register all components on one `Catalog` instance
4. **LLM spec** — mirror allowed components + layout rules in `catalog-spec.ts`
5. **Transport** — AG-UI `CUSTOM` events carrying A2UI message arrays
6. **Client render** — `MessageProcessor([catalog])` → `A2uiSurface`

---

## Prompts to try after `Badge`

- *Draft a budget approval card with a status badge and approve/reject buttons*
- *Show budget metrics as a list of cards*
- *Build a simple checklist for onboarding tasks* (uses `CheckBox`)
- *Use tabs for Overview, Details, and History* (uses `Tabs`)

---

## Stretch goals

| Topic | Why |
|-------|-----|
| Add `Select` or `Progress` | Richer form and feedback patterns |
| Add a full worked example to `catalog-spec.ts` | Fewer LLM structural mistakes |
| Read [a2ui-agui-research.md](./a2ui-agui-research.md) | Protocol and architecture context |
| Improve canvas action handling | Close the interaction loop (click → agent → regenerate) |
| Add a second catalog (e.g. read-only vs editable) | Multi-catalog / surface patterns |

---

## Before each session

```bash
npm run dev
```

Open [http://localhost:3000/prototype](http://localhost:3000/prototype).

Confirm `.env.local` has `GEMINI_API_KEY` if you want live LLM output (chat footer shows `gemini-2.5-flash`). Mock mode works without a key — same starter prompts, fixed templates.

---

## Picking up in chat

When you return, start with something like:

- *"Let's do the Badge exercise from the learning plan"*
- *"Walk me through adding Badge step by step — teach, don't just implement"*
- *"I'm on step 2 — trace Button with me"*

---

## File reference (catalog stack)

```
lib/a2ui/catalog/
  constants.ts          # Catalog ID
  shadcn-catalog.ts     # Catalog assembly
  shadcn-components.tsx # Component renderers + Zod APIs
  child-list.tsx        # Shared child-list helper
  flex-utils.ts         # Row/Column layout helpers

lib/agent/
  catalog-spec.ts       # LLM-facing contract
  normalize-a2ui-messages.ts  # Fix common LLM mistakes before render

lib/a2ui/
  sample-messages.ts    # Mock / fallback message templates

components/prototype/
  chat-panel.tsx        # HttpAgent + delivers a2ui.messages to parent
  a2ui-canvas-panel.tsx # MessageProcessor + A2uiSurface
```
