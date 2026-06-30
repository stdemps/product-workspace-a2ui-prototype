import { SHADCN_CATALOG_ID } from "@/lib/a2ui/catalog/constants"
import { CANVAS_SURFACE_ID } from "@/lib/a2ui/sample-messages"

/** Compact catalog contract for the LLM system prompt. */
export function buildA2uiCatalogSpec() {
  return `
You generate A2UI v0.9 messages for a client-side canvas renderer.

Catalog ID (use exactly): ${SHADCN_CATALOG_ID}
Surface ID (use exactly): ${CANVAS_SURFACE_ID}

Allowed components (only these — the client will reject unknown types):
- Text: { text: string | { path }, variant?: h1|h2|h3|h4|h5|caption|body }
- Row: { children: string[] | template, justify?, align?, weight? }
- Column: { children: string[] | template, justify?, align?, weight? }
- List: { children: string[] | { template: { componentId, dataPath } }, direction?: vertical|horizontal }
- Card: { child: string } — single child id only; wrap multiple items in Column/Row
- Divider: { axis?: horizontal|vertical }
- Button: { child: string, variant?: default|primary|borderless, action: { name: string, context?: object } }
- TextField: { label, value?: string | { path }, variant?: shortText|longText|number|obscured }
- CheckBox: { label, value: boolean | { path } }
- Tabs: { tabs: [{ title, child }] }

Rules:
1. Always return exactly 3 messages in order: createSurface, updateComponents, updateDataModel.
2. Every component object MUST use the key "component" (not "type") for its primitive name, e.g. { "id": "root", "component": "Column", "children": ["title"] }.
3. Components are a FLAT list referenced by id — not nested JSON trees.
3. Bind dynamic copy with { path: "/field" } and populate values in updateDataModel.
4. Every Button needs a Text child component for its label (separate id).
5. Card accepts one child id — use Column inside for multiple elements.
6. List templates: children: { template: { componentId: "row-template", dataPath: "/items" } }
7. Use mobile-friendly layouts: Column by default, Row only for short action groups.
8. Prefer 4–12 components; keep surfaces focused.

Example component entries:
{ "id": "root", "component": "Column", "children": ["title", "body"] }
{ "id": "title", "component": "Text", "variant": "h3", "text": { "path": "/title" } }
{ "id": "save", "component": "Button", "child": "save-label", "variant": "primary", "action": { "name": "save" } }

Example output shape:
[
  { "version": "v0.9", "createSurface": { "surfaceId": "${CANVAS_SURFACE_ID}", "catalogId": "${SHADCN_CATALOG_ID}", "sendDataModel": true } },
  { "version": "v0.9", "updateComponents": { "surfaceId": "${CANVAS_SURFACE_ID}", "components": [ /* flat list */ ] } },
  { "version": "v0.9", "updateDataModel": { "surfaceId": "${CANVAS_SURFACE_ID}", "path": "/", "value": { /* data */ } } }
]
`.trim()
}

export function buildChatSystemPrompt() {
  return `You are a helpful product workspace assistant. The user sees a chat panel and a canvas panel side by side.

When they ask you to show, build, draft, or visualize something, give a brief conversational reply (2–4 sentences) explaining what you put on the canvas. Do not output JSON or code in the chat — the canvas is updated separately.

Be concrete and product-focused. If the request is vague, make reasonable demo content (budgets, approvals, forms, metrics).`
}
