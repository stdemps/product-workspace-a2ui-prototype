import { EventType } from "@ag-ui/core"
import { NextResponse } from "next/server"

import {
  extractConversationMessages,
  extractLatestUserMessage,
  generateA2uiMessages,
  isLlmAgentEnabled,
  streamChatReply,
} from "@/lib/agent/llm-agent"
import { createSseStream } from "@/lib/agent/sse"
import { buildBudgetPreviewMessages } from "@/lib/a2ui/sample-messages"
import { SHADCN_CATALOG_ID } from "@/lib/a2ui/catalog/constants"

function mockAssistantReply(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes("form") || normalized.includes("input")) {
    return "I generated an input form on the canvas using shadcn TextField and Button components from your custom A2UI catalog."
  }

  if (normalized.includes("chart") || normalized.includes("metric")) {
    return "I generated a metrics layout on the canvas using List and Card components. In production you would map chart primitives into the same catalog."
  }

  if (normalized.includes("action:")) {
    return "Got the canvas action. I can regenerate the surface or continue the workflow based on that interaction."
  }

  return "I generated a shadcn-backed card on the canvas with title, body, and action buttons. Add GEMINI_API_KEY to .env.local for real LLM-generated UI."
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string
    messages?: Array<{ role?: string; content?: unknown }>
    runId?: string
    threadId?: string
  }

  const conversation = extractConversationMessages(body)
  const userMessage = extractLatestUserMessage(conversation)

  if (!userMessage) {
    return NextResponse.json({ error: "A user message is required" }, { status: 400 })
  }

  const runId = body.runId ?? crypto.randomUUID()
  const threadId = body.threadId ?? crypto.randomUUID()
  const messageId = crypto.randomUUID()
  const useLlm = isLlmAgentEnabled()

  const stream = createSseStream(async (write) => {
    write({
      type: EventType.RUN_STARTED,
      runId,
      threadId,
    })
    write({
      type: EventType.TEXT_MESSAGE_START,
      messageId,
      role: "assistant",
    })

    let assistantReply = ""

    if (useLlm) {
      const generator = streamChatReply(conversation)
      let result = await generator.next()

      while (!result.done) {
        write({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: result.value,
        })
        result = await generator.next()
      }

      assistantReply = result.value ?? ""
    } else {
      assistantReply = mockAssistantReply(userMessage)

      for (const token of assistantReply.split(" ")) {
        write({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: `${token} `,
        })
      }
    }

    write({
      type: EventType.TEXT_MESSAGE_END,
      messageId,
    })

    let a2uiMessages = buildBudgetPreviewMessages(userMessage)

    try {
      a2uiMessages = useLlm
        ? await generateA2uiMessages(userMessage, assistantReply)
        : buildBudgetPreviewMessages(userMessage)
    } catch (error) {
      console.error("A2UI message generation failed, using fallback:", error)
    }

    write({
      type: EventType.CUSTOM,
      name: "a2ui.messages",
      value: a2uiMessages,
    })
    write({
      type: EventType.CUSTOM,
      name: "a2ui.catalog",
      value: { catalogId: SHADCN_CATALOG_ID },
    })
    write({
      type: EventType.RUN_FINISHED,
      runId,
      threadId,
    })
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
