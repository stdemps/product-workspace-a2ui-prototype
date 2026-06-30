## Learned User Preferences

- Prefer a teaching/guidance approach when learning new patterns (e.g. A2UI catalog definition) so skills transfer to other projects
- Prefer Gemini free tier for LLM in this prototype over paid OpenAI API; has Claude subscription but chose Gemini for cost-free learning
- Wants prototype UI styled like Cursor's agent chat + editor split (dark chrome, prose chat, surface preview pane)

## Learned Workspace Facts

- Experimental A2UI + AG-UI prototype lives at `/prototype`; overview in `README-A2UI-PROTOTYPE.md`
- LLM is Gemini via `GEMINI_API_KEY` in `.env.local` (default `gemini-2.5-flash`); mock mode when unset
- Agent uses two calls: streamed chat reply, then structured A2UI JSON guided by `lib/agent/catalog-spec.ts`
- Custom shadcn catalog in `lib/a2ui/catalog/` maps basic A2UI component APIs to shadcn/ui
- AG-UI SSE events must include `threadId` on both `RUN_STARTED` and `RUN_FINISHED`
- Prototype shell is dark; generated UI renders in a light `.prototype-surface-preview` island for shadcn readability
- Stack: Next.js App Router, `@ag-ui/client` HttpAgent, `@a2ui/react` MessageProcessor + A2uiSurface
