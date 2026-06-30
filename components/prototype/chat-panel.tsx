"use client"

import * as React from "react"
import type { Message } from "@ag-ui/core"
import { EventType } from "@ag-ui/core"
import { ArrowUp, Loader2 } from "lucide-react"

import { getPrototypeAgent } from "@/lib/agent/prototype-agent"
import { normalizeA2uiMessages } from "@/lib/agent/normalize-a2ui-messages"
import { buildBudgetPreviewMessages } from "@/lib/a2ui/sample-messages"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { A2uiAgentMessage } from "@/lib/a2ui/sample-messages"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatPanelProps {
  onA2uiMessages: (messages: A2uiAgentMessage[]) => void
  externalPrompt?: string | null
  onExternalPromptHandled?: () => void
  onCanvasGenerated?: () => void
  className?: string
}

const STARTER_PROMPTS = [
  "Draft a budget approval card",
  "Show a budget input form",
  "Show budget metrics",
]

function toChatMessages(messages: readonly Message[]): ChatMessage[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      content: typeof message.content === "string" ? message.content : "",
    }))
    .filter((message) => message.content.length > 0 || message.role === "assistant")
}

export function ChatPanel({
  onA2uiMessages,
  externalPrompt,
  onExternalPromptHandled,
  onCanvasGenerated,
  className,
}: ChatPanelProps) {
  const agentRef = React.useRef(getPrototypeAgent())
  const [agentMode, setAgentMode] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask for UI on the canvas — cards, forms, metrics, checklists. I'll stream a reply here and render the layout in the surface preview.",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [streamStartedAt, setStreamStartedAt] = React.useState<number | null>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  React.useEffect(() => {
    void fetch("/api/agent/status")
      .then((response) => response.json())
      .then((data: { mode?: string; model?: string; provider?: string }) => {
        if (data.mode === "llm") {
          const label = data.provider === "gemini" ? "Gemini" : "LLM"
          setAgentMode(data.model ? `${label} · ${data.model}` : label)
          return
        }
        setAgentMode("Mock mode")
      })
      .catch(() => setAgentMode(null))
  }, [])

  const runAgent = React.useCallback(
    async (prompt: string) => {
      const text = prompt.trim()
      if (!text || isStreaming) return

      const agent = agentRef.current
      setIsStreaming(true)
      setStreamStartedAt(Date.now())

      try {
        agent.addMessage({
          id: crypto.randomUUID(),
          role: "user",
          content: text,
        })

        let receivedA2ui = false

        const deliverA2uiMessages = (raw: unknown) => {
          if (!Array.isArray(raw) || raw.length === 0) return
          receivedA2ui = true
          onA2uiMessages(normalizeA2uiMessages(raw as A2uiAgentMessage[]))
          onCanvasGenerated?.()
        }

        await agent.runAgent(
          {},
          {
            onMessagesChanged: ({ messages: nextMessages }) => {
              setMessages(toChatMessages(nextMessages))
            },
            onCustomEvent: ({ event }) => {
              if (event.name === "a2ui.messages") {
                deliverA2uiMessages(event.value)
              }
            },
            onEvent: ({ event }) => {
              if (event.type === EventType.CUSTOM && event.name === "a2ui.messages") {
                deliverA2uiMessages(event.value)
              }
            },
          }
        )

        if (!receivedA2ui) {
          deliverA2uiMessages(buildBudgetPreviewMessages(text))
        }
      } catch (error) {
        console.error(error)
        onA2uiMessages(buildBudgetPreviewMessages(text))
        onCanvasGenerated?.()
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Something went wrong talking to the agent. Check the server logs and your API key.",
          },
        ])
      } finally {
        setIsStreaming(false)
        setStreamStartedAt(null)
      }
    },
    [isStreaming, onA2uiMessages, onCanvasGenerated]
  )

  React.useEffect(() => {
    if (!externalPrompt?.trim()) return

    void runAgent(externalPrompt).finally(() => {
      onExternalPromptHandled?.()
    })
  }, [externalPrompt, onExternalPromptHandled, runAgent])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void runAgent(input)
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (!isStreaming && input.trim()) {
        handleSubmit(event)
      }
    }
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <ScrollArea className="flex-1">
        <div className="space-y-6 px-4 py-5 md:px-5">
          {messages.map((message, index) => (
            <article key={message.id} className="space-y-2">
              {message.role === "user" ? (
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 md:px-3.5">
                  <p className="text-sm leading-relaxed text-[#ececec] md:text-[15px]">{message.content}</p>
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {index > 0 || message.id !== "welcome" ? (
                    <p className="text-[11px] font-medium uppercase tracking-wide text-white/30">Assistant</p>
                  ) : null}
                  <div className="text-sm leading-relaxed text-[#c8c8c8] md:text-[15px] md:leading-7">
                    {message.content || (
                      <span className="inline-flex items-center gap-2 text-white/45">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        Thinking…
                      </span>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="shrink-0 space-y-3 border-t border-white/[0.08] bg-[#171717] px-3 py-3 md:px-4 md:py-4">
        {messages.length <= 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isStreaming}
                onClick={() => void runAgent(prompt)}
                className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/65 transition-colors hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white/90 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="relative rounded-xl border border-white/[0.1] bg-[#1f1f1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-within:border-white/[0.18]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                event.target.style.height = "auto"
                event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Send follow-up"
              rows={1}
              disabled={isStreaming}
              aria-label="Chat message"
              className="block min-h-[48px] w-full resize-none bg-transparent px-3.5 py-3 pr-14 text-base leading-relaxed text-[#ececec] placeholder:text-white/35 focus:outline-none md:min-h-[52px] md:text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isStreaming || !input.trim()}
              className="absolute bottom-2 right-2 h-9 w-9 rounded-lg bg-white/[0.12] text-white hover:bg-white/[0.18] disabled:opacity-30"
              aria-label={isStreaming ? "Streaming response" : "Send message"}
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between gap-3 text-[10px] text-white/35">
          <span className="truncate">{agentMode ?? "Connecting…"}</span>
          <span className="shrink-0">
            {isStreaming && streamStartedAt
              ? "Working…"
              : "AG-UI · A2UI catalog"}
          </span>
        </div>
      </div>
    </div>
  )
}
