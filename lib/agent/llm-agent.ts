import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"

import type { A2uiAgentMessage } from "@/lib/a2ui/sample-messages"
import { buildBudgetPreviewMessages } from "@/lib/a2ui/sample-messages"
import { buildA2uiCatalogSpec, buildChatSystemPrompt } from "@/lib/agent/catalog-spec"
import {
  getA2uiComponentIssues,
  normalizeA2uiMessages,
} from "@/lib/agent/normalize-a2ui-messages"

const a2uiMessagesSchema = z.array(z.record(z.string(), z.unknown())).min(3)

export interface ConversationMessage {
  role: "user" | "assistant" | "system"
  content: string
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey?.trim()) return null

  return new GoogleGenerativeAI(apiKey)
}

export function isLlmAgentEnabled() {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

export function getLlmProvider() {
  return isLlmAgentEnabled() ? "gemini" : null
}

export function getLlmModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash"
}

function toGeminiHistory(messages: ConversationMessage[]) {
  if (messages.length <= 1) return []

  return messages.slice(0, -1).map((message) => ({
    role: message.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: message.content }],
  }))
}

export async function* streamChatReply(
  messages: ConversationMessage[]
): AsyncGenerator<string, string> {
  const client = getGeminiClient()
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const latestUserMessage = extractLatestUserMessage(messages)
  const model = client.getGenerativeModel({
    model: getLlmModel(),
    systemInstruction: buildChatSystemPrompt(),
  })

  const chat = model.startChat({
    history: toGeminiHistory(messages),
  })

  const stream = await chat.sendMessageStream(latestUserMessage)
  let fullText = ""

  for await (const chunk of stream.stream) {
    const delta = chunk.text()
    if (delta) {
      fullText += delta
      yield delta
    }
  }

  return fullText
}

export async function generateA2uiMessages(
  userMessage: string,
  assistantReply: string
): Promise<A2uiAgentMessage[]> {
  const client = getGeminiClient()
  if (!client) {
    return buildBudgetPreviewMessages(userMessage)
  }

  const model = client.getGenerativeModel({
    model: getLlmModel(),
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
    systemInstruction: `${buildA2uiCatalogSpec()}\n\nRespond with JSON: { "a2uiMessages": [ ...3 messages ] }`,
  })

  try {
    const response = await model.generateContent(
      `User request: ${userMessage}\n\nAssistant already replied in chat: ${assistantReply}\n\nGenerate the A2UI canvas messages for this interaction.`
    )

    const raw = response.response.text()
    if (!raw) {
      return buildBudgetPreviewMessages(userMessage)
    }

    const parsed = JSON.parse(raw) as { a2uiMessages?: unknown }
    const validated = a2uiMessagesSchema.parse(parsed.a2uiMessages)
    const normalized = normalizeA2uiMessages(validated as unknown as A2uiAgentMessage[])
    const issues = getA2uiComponentIssues(normalized)

    if (issues.length > 0) {
      console.warn("LLM A2UI output had component issues, using fallback:", issues)
      return buildBudgetPreviewMessages(userMessage)
    }

    return normalized
  } catch (error) {
    console.error("Gemini A2UI generation failed, using fallback:", error)
    return buildBudgetPreviewMessages(userMessage)
  }
}

export function extractConversationMessages(body: {
  message?: string
  messages?: Array<{ role?: string; content?: unknown }>
}): ConversationMessage[] {
  const fromHistory =
    body.messages
      ?.filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: typeof message.content === "string" ? message.content : "",
      }))
      .filter((message) => message.content.trim().length > 0) ?? []

  if (fromHistory.length > 0) {
    return fromHistory
  }

  if (body.message?.trim()) {
    return [{ role: "user", content: body.message.trim() }]
  }

  return []
}

export function extractLatestUserMessage(messages: ConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "user") {
      return messages[index].content
    }
  }

  return ""
}
