import type { A2uiAgentMessage } from "@/lib/a2ui/sample-messages"
import { CANVAS_SURFACE_ID } from "@/lib/a2ui/sample-messages"
import { SHADCN_CATALOG_ID } from "@/lib/a2ui/catalog/constants"

const ALLOWED_COMPONENTS = new Set([
  "Text",
  "Row",
  "Column",
  "List",
  "Card",
  "Divider",
  "Button",
  "TextField",
  "CheckBox",
  "Tabs",
])

type ComponentRecord = Record<string, unknown>

function normalizeComponentName(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined

  const trimmed = value.trim()
  const canonical = ALLOWED_COMPONENTS.has(trimmed)
    ? trimmed
    : ALLOWED_COMPONENTS.has(trimmed[0]?.toUpperCase() + trimmed.slice(1))
      ? trimmed[0].toUpperCase() + trimmed.slice(1)
      : trimmed

  return ALLOWED_COMPONENTS.has(canonical) ? canonical : undefined
}

function normalizeComponentRecord(component: ComponentRecord) {
  const componentName = normalizeComponentName(
    component.component ?? component.type ?? component.componentType ?? component.kind
  )

  const { type, componentType, kind, ...rest } = component

  return {
    ...rest,
    ...(componentName ? { component: componentName } : {}),
  }
}

function normalizeUpdateComponentsMessage(message: A2uiAgentMessage) {
  if (!("updateComponents" in message) || !message.updateComponents) {
    return message
  }

  const payload = message.updateComponents
  const components = Array.isArray(payload.components)
    ? payload.components.map((component) => normalizeComponentRecord(component as ComponentRecord))
    : payload.components

  return {
    ...message,
    updateComponents: {
      ...payload,
      surfaceId: payload.surfaceId ?? CANVAS_SURFACE_ID,
      components,
    },
  }
}

function normalizeCreateSurfaceMessage(message: A2uiAgentMessage) {
  if (!("createSurface" in message) || !message.createSurface) {
    return message
  }

  return {
    ...message,
    createSurface: {
      ...message.createSurface,
      surfaceId: message.createSurface.surfaceId ?? CANVAS_SURFACE_ID,
      catalogId: message.createSurface.catalogId ?? SHADCN_CATALOG_ID,
      sendDataModel: message.createSurface.sendDataModel ?? true,
    },
  }
}

function normalizeUpdateDataModelMessage(message: A2uiAgentMessage) {
  if (!("updateDataModel" in message) || !message.updateDataModel) {
    return message
  }

  return {
    ...message,
    updateDataModel: {
      ...message.updateDataModel,
      surfaceId: message.updateDataModel.surfaceId ?? CANVAS_SURFACE_ID,
    },
  }
}

/** Fix common LLM mistakes (type vs component, wrong ids) before rendering. */
export function normalizeA2uiMessages(messages: A2uiAgentMessage[]) {
  return messages.map((message) => {
    if ("createSurface" in message) {
      return normalizeCreateSurfaceMessage(message)
    }

    if ("updateComponents" in message) {
      return normalizeUpdateComponentsMessage(message)
    }

    if ("updateDataModel" in message) {
      return normalizeUpdateDataModelMessage(message)
    }

    return message
  })
}

/** Delete existing surface, then apply a fresh message batch. */
export function prepareA2uiMessagesForRender(messages: A2uiAgentMessage[]) {
  const normalized = normalizeA2uiMessages(messages)

  return [
    {
      version: "v0.9" as const,
      deleteSurface: { surfaceId: CANVAS_SURFACE_ID },
    },
    ...normalized,
  ]
}

export function getA2uiComponentIssues(messages: A2uiAgentMessage[]) {
  const issues: string[] = []

  for (const message of messages) {
    if (!("updateComponents" in message) || !Array.isArray(message.updateComponents?.components)) {
      continue
    }

    for (const component of message.updateComponents.components) {
      const record = component as ComponentRecord
      const id = typeof record.id === "string" ? record.id : "(missing id)"
      const name = normalizeComponentName(
        record.component ?? record.type ?? record.componentType ?? record.kind
      )

      if (!name) {
        issues.push(`Component "${id}" is missing a valid component type`)
      }
    }
  }

  return issues
}
