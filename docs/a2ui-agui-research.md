# A2UI + AG-UI Research Notes

Prototype clone for exploring chat-led, canvas-style agent UI (Cursor / Gemini / Codex pattern).

## The two protocols (different jobs)

| Layer | Protocol | Role |
| --- | --- | --- |
| Agent ↔ User transport | **AG-UI** | Event stream between frontend and agent backend (chat tokens, tool calls, shared state, interrupts) |
| Generative UI payload | **A2UI** | Declarative JSON describing component trees the client renders natively |

AG-UI is **not** a UI spec. A2UI is **not** a transport. They compose:

```
User → Chat UI → AG-UI (SSE/WebSocket) → Agent
                      ↓ CUSTOM / tool result
                 A2UI message stream → Canvas renderer
```

References:
- [A2UI](https://a2ui.org/)
- [AG-UI](https://docs.ag-ui.com/introduction)
- [Google: Introducing A2UI](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)

## A2UI mental model

1. **Surface** — a canvas region (sidebar, main panel, modal). Created with `createSurface`.
2. **Components** — flat adjacency list (`updateComponents`), not nested JSON trees.
3. **Data model** — separate state (`updateDataModel`) bound via JSON Pointer paths.
4. **Catalog** — JSON Schema contract listing allowed components. Agent can only request components from the catalog the client advertises.

Message flow (v0.9):

1. `createSurface` — pick catalog, optional `sendDataModel`
2. `updateComponents` — layout tree by ID references
3. `updateDataModel` — populate bound fields
4. Incremental `updateComponents` / `updateDataModel` for live edits
5. `deleteSurface` — tear down

Security: agents send **data**, not executable code. The client maps catalog names → trusted React/shadcn components.

## Basic catalog (official)

From `@a2ui/react/v0_9` / `@a2ui/web_core`:

| Category | Components |
| --- | --- |
| Layout | `Row`, `Column`, `List`, `Card`, `Tabs`, `Modal`, `Divider` |
| Content | `Text`, `Image`, `Icon`, `Video`, `AudioPlayer` |
| Input | `Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider`, `DateTimeInput` |

Catalog ID is exposed as `basicCatalog.id` and negotiated via client `supportedCatalogIds`.

## Custom catalog for shadcn (recommended path)

For production you should **define your own catalog** mapping to existing shadcn/ui primitives rather than using the generic basic renderer:

1. Define Zod schemas per component (`MyBudgetCardApi`, etc.)
2. Implement with `createComponentImplementation` → shadcn `Card`, `Button`, `Input`…
3. Register as `new Catalog(catalogId, components, functions)`
4. Pass catalog to `MessageProcessor([myCatalog])`
5. Advertise `catalogId` in AG-UI / A2A metadata during handshake

Community options to study:
- [a2ui-shadcn](https://github.com/rezashahnazar/a2ui-shadcn) — 30+ shadcn mappings, v0.9
- [a2ui-react-shadcn](https://github.com/burka/a2ui-react-shadcn) — smaller set, live demo
- [Vercel json-render](https://github.com/vercel-labs/json-render) — similar generative UI idea (not A2UI protocol), 36 shadcn components

### Mapping this repo's shadcn inventory → catalog candidates

Existing components under `components/ui/` that map well to agent-generated surfaces:

| shadcn component | A2UI-style primitive | Agent use cases |
| --- | --- | --- |
| `card` | Card / Panel | Summaries, previews, entity detail |
| `button` | Button | Primary actions, approvals |
| `input`, `textarea` | TextField | Forms, inline edit |
| `select`, `radio-group`, `checkbox`, `switch` | ChoicePicker / CheckBox | Filters, settings |
| `slider` | Slider | Ranges, allocations |
| `tabs` | Tabs | Multi-section views |
| `table` | DataTable (custom) | Budget lines, comparisons |
| `alert`, `badge` | Status chips | Validation, state |
| `progress` | ProgressIndicator (custom) | Completion, spend vs budget |
| `sheet`, `dialog` | Modal | Focused tasks without leaving chat |
| `accordion` | Accordion (custom) | Collapsible sections |
| `calendar` + `date-fns` | DateTimeInput | Event dates |
| `chart` (future) | Custom chart component | Trends |

Start with **8–12 high-value primitives** for MVP catalog; expand as agent prompts reveal gaps.

## AG-UI event types (transport)

Common events used in this prototype pattern:

| Event | Purpose |
| --- | --- |
| `RUN_STARTED` / `RUN_FINISHED` | Agent run lifecycle |
| `TEXT_MESSAGE_*` | Streaming chat tokens |
| `TOOL_CALL_*` | Tool execution visibility |
| `STATE_DELTA` | Shared app/agent state patches |
| `CUSTOM` | Extension point — carry `a2ui.messages` payloads |

Official client: `@ag-ui/client` (`HttpAgent`) or CopilotKit React bindings.

## This prototype

| Path | Purpose |
| --- | --- |
| `/prototype` | Mobile-first split: chat left, canvas right (stacked on mobile) |
| `/api/agent` | Mock AG-UI SSE stream + `CUSTOM` A2UI payloads |
| `lib/a2ui/sample-messages.ts` | Demo message builders (card / form / metrics) |
| `components/prototype/*` | Chat panel + A2UI canvas renderer |

Run:

```bash
cd ../product-workspace-a2ui-prototype
npm install
npm run dev
```

Open `/prototype`.

## Next steps

1. Replace mock `/api/agent` with real LLM + structured A2UI output (or tool that returns A2UI JSON).
2. Define `shadcnCatalog` mapping your design system.
3. Wire `HttpAgent` from `@ag-ui/client` instead of manual SSE parsing.
4. Add `supportedCatalogIds` + inline catalog in agent system prompt.
5. Handle canvas actions (`onAction`) → send back to agent via AG-UI resume/input.
6. Evaluate CopilotKit if you want pre-built chat chrome and AG-UI integration.
