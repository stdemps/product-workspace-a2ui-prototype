import { NextResponse } from "next/server"

import { getLlmModel, getLlmProvider, isLlmAgentEnabled } from "@/lib/agent/llm-agent"

export async function GET() {
  const llmEnabled = isLlmAgentEnabled()

  return NextResponse.json({
    mode: llmEnabled ? "llm" : "mock",
    provider: getLlmProvider(),
    model: llmEnabled ? getLlmModel() : null,
  })
}
