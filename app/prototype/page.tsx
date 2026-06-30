"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, PanelLeft } from "lucide-react"
import type { A2uiClientAction } from "@a2ui/web_core/v0_9"

import { A2uiCanvasPanel } from "@/components/prototype/a2ui-canvas-panel"
import { ChatPanel } from "@/components/prototype/chat-panel"
import { Button } from "@/components/ui/button"
import type { A2uiAgentMessage } from "@/lib/a2ui/sample-messages"
import { cn } from "@/lib/utils"

export default function PrototypePage() {
  const [a2uiMessages, setA2uiMessages] = React.useState<A2uiAgentMessage[]>([])
  const [canvasActionPrompt, setCanvasActionPrompt] = React.useState<string | null>(null)
  const [mobileView, setMobileView] = React.useState<"chat" | "canvas">("chat")

  const handleCanvasAction = React.useCallback((action: A2uiClientAction) => {
    setCanvasActionPrompt(`Canvas action: ${action.name}`)
    setMobileView("chat")
  }, [])

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-[#e4e4e4]">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#141414] px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-white/60 hover:bg-white/[0.06] hover:text-white"
            asChild
          >
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0 truncate">
            <p className="truncate text-xs font-medium text-[#e4e4e4]">A2UI prototype</p>
            <p className="truncate text-[10px] text-white/40">Chat + generative canvas</p>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2.5 text-xs",
              mobileView === "chat"
                ? "bg-white/[0.08] text-white"
                : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
            )}
            onClick={() => setMobileView("chat")}
          >
            Chat
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2.5 text-xs",
              mobileView === "canvas"
                ? "bg-white/[0.08] text-white"
                : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
            )}
            onClick={() => setMobileView("canvas")}
          >
            Canvas
          </Button>
        </div>

        <div className="hidden items-center gap-2 text-[10px] text-white/35 lg:flex">
          <PanelLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Agent · Surface preview</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col border-white/[0.08] bg-[#171717] lg:w-[min(100%,440px)] lg:shrink-0 lg:border-r xl:w-[480px]",
            mobileView === "chat" ? "flex" : "hidden lg:flex"
          )}
        >
          <ChatPanel
            onA2uiMessages={setA2uiMessages}
            externalPrompt={canvasActionPrompt}
            onExternalPromptHandled={() => setCanvasActionPrompt(null)}
            onCanvasGenerated={() => setMobileView("canvas")}
            className="h-full w-full"
          />
        </section>

        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col bg-[#111111]",
            mobileView === "canvas" ? "flex" : "hidden lg:flex"
          )}
        >
          <A2uiCanvasPanel
            messages={a2uiMessages}
            onAction={handleCanvasAction}
            className="h-full w-full"
          />
        </section>
      </div>
    </main>
  )
}
