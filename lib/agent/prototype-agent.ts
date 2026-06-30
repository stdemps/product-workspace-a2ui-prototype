"use client"

import { HttpAgent } from "@ag-ui/client"

let agentInstance: HttpAgent | null = null

export function getPrototypeAgent() {
  if (!agentInstance) {
    agentInstance = new HttpAgent({
      url: "/api/agent",
    })
  }

  return agentInstance
}
