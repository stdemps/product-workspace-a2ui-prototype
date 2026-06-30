"use client"

import * as React from "react"
import { MessageProcessor } from "@a2ui/web_core/v0_9"
import { A2uiSurface } from "@a2ui/react/v0_9"
import type { ReactComponentImplementation } from "@a2ui/react/v0_9"
import type { A2uiClientAction } from "@a2ui/web_core/v0_9"
import { AlertCircle, LayoutTemplate, Sparkles } from "lucide-react"

import type { A2uiAgentMessage } from "@/lib/a2ui/sample-messages"
import { prepareA2uiMessagesForRender } from "@/lib/agent/normalize-a2ui-messages"
import { shadcnCatalog } from "@/lib/a2ui/catalog/shadcn-catalog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface A2uiCanvasPanelProps {
  messages: A2uiAgentMessage[]
  onAction?: (action: A2uiClientAction) => void
  className?: string
}

function countComponents(messages: A2uiAgentMessage[]) {
  const updateMessage = messages.find((message) => "updateComponents" in message)
  if (!updateMessage || !("updateComponents" in updateMessage)) return 0

  return updateMessage.updateComponents?.components?.length ?? 0
}

export function A2uiCanvasPanel({ messages, onAction, className }: A2uiCanvasPanelProps) {
  const onActionRef = React.useRef(onAction)
  onActionRef.current = onAction

  const [surfaces, setSurfaces] = React.useState<
    React.ComponentProps<typeof A2uiSurface>["surface"][]
  >([])
  const [renderError, setRenderError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (messages.length === 0) {
      setRenderError(null)
      setSurfaces([])
      return
    }

    const processor = new MessageProcessor([shadcnCatalog], (action) => {
      onActionRef.current?.(action)
    })

    try {
      processor.processMessages(prepareA2uiMessagesForRender(messages))
      setSurfaces(Array.from(processor.model.surfacesMap.values()))
      setRenderError(null)
    } catch (error) {
      console.error("Failed to render A2UI surface:", error)
      setSurfaces([])
      setRenderError(
        error instanceof Error
          ? error.message
          : "The generated UI could not be rendered. Try asking again."
      )
    }
  }, [messages])

  const hasSurface = surfaces.length > 0
  const componentCount = countComponents(messages)
  const statusLabel = renderError ? "Error" : hasSurface ? "Ready" : "Empty"

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#181818] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04]">
            <LayoutTemplate className="h-4 w-4 text-white/55" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium text-[#ececec]">Generated UI</h2>
            <p className="truncate text-[11px] text-white/40">
              Agent-built surface from your shadcn catalog
            </p>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium",
            renderError
              ? "bg-red-500/15 text-red-300"
              : hasSurface
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-white/[0.06] text-white/45"
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex h-8 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#141414] px-4 text-[11px] text-white/40">
        <span className="truncate">Preview</span>
        <span className="shrink-0 tabular-nums">
          {hasSurface ? `${componentCount} components` : renderError ? "Render failed" : "No surface yet"}
        </span>
      </div>

      <ScrollArea className="flex-1 bg-[#111111]">
        <div className="min-h-full p-4 md:p-6">
          {renderError ? (
            <div className="flex min-h-[min(420px,60dvh)] flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/[0.06] px-6 py-10 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-300/80" aria-hidden="true" />
              <p className="text-sm font-medium text-red-100/90">Couldn&apos;t render this surface</p>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-red-100/60 md:text-sm">
                {renderError}
              </p>
              <p className="mt-4 max-w-md text-xs text-white/35">
                Try a simpler prompt, or use one of the starter examples in chat.
              </p>
            </div>
          ) : !hasSurface ? (
            <div className="flex min-h-[min(420px,60dvh)] flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-[#0f0f0f]/80 px-6 py-10 text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Sparkles className="h-5 w-5 text-white/35" aria-hidden="true" />
              </div>
              <p className="max-w-sm text-sm font-medium text-white/55">Nothing generated yet</p>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-white/35 md:text-sm">
                Ask the agent to build a card, form, or metrics view. The rendered output will appear
                here as a live preview.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <div className="prototype-surface-preview overflow-hidden rounded-lg border border-white/[0.08] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:p-5">
                {surfaces.map((surface) => (
                  <A2uiSurface key={surface.id} surface={surface} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
