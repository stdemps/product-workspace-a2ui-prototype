# A2UI + AG-UI Prototype

Experimental clone of `product-workspace` for exploring chat-led, canvas-style agent UI.

## Quick start

```bash
npm install
cp .env.example .env.local
# Add your Gemini key to .env.local (free tier — see below)
npm run dev
```

Open [http://localhost:3000/prototype](http://localhost:3000/prototype).

### LLM setup (Gemini — free tier)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and create an API key (no credit card required for the free tier).
2. Add to `.env.local`:

```bash
GEMINI_API_KEY=AIza...
# optional (defaults to gemini-2.5-flash):
GEMINI_MODEL=gemini-2.5-flash
```

3. Restart the dev server.

Without a key, `/api/agent` uses keyword-based mock responses (same starter prompts, fixed templates). With a key:

1. **Chat** streams a real Gemini reply via AG-UI SSE
2. **Canvas** gets A2UI JSON from a second structured LLM call (catalog spec in `lib/agent/catalog-spec.ts`)

Check mode in the chat header (`Gemini gemini-2.5-flash` vs `mock`).

## Stack

- **AG-UI** (`@ag-ui/client`, `@ag-ui/core`) — `HttpAgent` SSE transport for chat streaming
- **A2UI** (`@a2ui/react`, `@a2ui/web_core`) — declarative component payloads rendered on the canvas
- **Custom shadcn catalog** — `lib/a2ui/catalog/shadcn-components.tsx` (10 components mapped to shadcn/ui)

## shadcn catalog components

`Text`, `Row`, `Column`, `List`, `Card`, `Divider`, `Button`, `TextField`, `CheckBox`, `Tabs`

Catalog ID: `https://product-workspace.local/catalogs/shadcn/v1.json`

## Architecture

| Path | Purpose |
|------|---------|
| `/prototype` | Chat (left) + canvas (right), mobile-first stack |
| `/api/agent` | AG-UI SSE agent — Gemini when `GEMINI_API_KEY` set, else mock |
| `/api/agent/status` | `{ mode, provider, model }` for UI badge |
| `lib/agent/llm-agent.ts` | Streaming chat + structured A2UI generation |
| `lib/agent/catalog-spec.ts` | Catalog contract injected into LLM system prompt |
| `lib/agent/prototype-agent.ts` | Shared `HttpAgent` instance |
| `lib/a2ui/catalog/*` | shadcn catalog + renderers |
| `components/prototype/chat-panel.tsx` | `HttpAgent.runAgent()` + `onCustomEvent` for A2UI |
| `components/prototype/a2ui-canvas-panel.tsx` | `MessageProcessor` + `A2uiSurface` |

Canvas button clicks loop back into chat as `Canvas action: …` prompts.

## Docs

See [docs/a2ui-agui-research.md](./docs/a2ui-agui-research.md) for protocol overview, component catalog mapping, and next steps.

## Try it

Starter prompts on `/prototype`:

- “Draft a budget approval card”
- “Show a budget input form”
- “Show budget metrics”

The mock agent at `/api/agent` streams AG-UI events and attaches A2UI messages via a `CUSTOM` event.
