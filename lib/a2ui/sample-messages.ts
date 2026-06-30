import type { A2uiMessage } from "@a2ui/web_core/v0_9"

import { SHADCN_CATALOG_ID } from "@/lib/a2ui/catalog/constants"

const CATALOG_ID = SHADCN_CATALOG_ID
const SURFACE_ID = "canvas-main"

export type A2uiAgentMessage = A2uiMessage

export function buildBudgetPreviewMessages(prompt: string): A2uiAgentMessage[] {
  const normalized = prompt.toLowerCase()

  if (normalized.includes("form") || normalized.includes("input")) {
    return buildFormSurface(prompt)
  }

  if (normalized.includes("chart") || normalized.includes("metric")) {
    return buildMetricsSurface(prompt)
  }

  return buildCardSurface(prompt)
}

function baseCreateSurface(): A2uiAgentMessage {
  return {
    version: "v0.9",
    createSurface: {
      surfaceId: SURFACE_ID,
      catalogId: CATALOG_ID,
      sendDataModel: true,
    },
  }
}

function buildCardSurface(prompt: string): A2uiAgentMessage[] {
  return [
    baseCreateSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          { id: "root", component: "Column", children: ["title", "body", "status", "actions"] },
          { id: "title", component: "Text", variant: "h3", text: { path: "/title" } },
          { id: "body", component: "Text", text: { path: "/body" } },
          { id: "status", component: "Text", variant: "caption", text: { path: "/status" } },
          {
            id: "actions",
            component: "Row",
            children: ["approve", "edit"],
          },
          { id: "approve-label", component: "Text", text: "Approve draft" },
          {
            id: "approve",
            component: "Button",
            child: "approve-label",
            variant: "primary",
            action: { name: "approve_draft" },
          },
          { id: "edit-label", component: "Text", text: "Refine in chat" },
          {
            id: "edit",
            component: "Button",
            child: "edit-label",
            variant: "borderless",
            action: { name: "refine_in_chat" },
          },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          title: "Generated canvas preview",
          status: "Draft",
          body: `The agent mapped "${prompt}" to a shadcn-backed card (Column, Text, Button). Ask for a form or metrics view to explore more catalog components.`,
        },
      },
    },
  ]
}

function buildFormSurface(prompt: string): A2uiAgentMessage[] {
  return [
    baseCreateSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          { id: "root", component: "Card", child: "form-col" },
          {
            id: "form-col",
            component: "Column",
            children: ["heading", "name", "amount", "submit"],
          },
          { id: "heading", component: "Text", variant: "h4", text: { path: "/heading" } },
          {
            id: "name",
            component: "TextField",
            label: "Line item",
            value: { path: "/name" },
          },
          {
            id: "amount",
            component: "TextField",
            label: "Amount",
            value: { path: "/amount" },
          },
          { id: "submit-label", component: "Text", text: "Save line item" },
          {
            id: "submit",
            component: "Button",
            child: "submit-label",
            variant: "primary",
            action: { name: "save_line_item" },
          },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          heading: `Form generated from: "${prompt}"`,
          name: "Venue deposit",
          amount: "£2,500",
        },
      },
    },
  ]
}

function buildMetricsSurface(prompt: string): A2uiAgentMessage[] {
  return [
    baseCreateSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          { id: "root", component: "Column", children: ["heading", "metrics"] },
          { id: "heading", component: "Text", variant: "h4", text: { path: "/heading" } },
          {
            id: "metrics",
            component: "List",
            children: { template: { componentId: "metric-row", dataPath: "/metrics" } },
          },
          { id: "metric-row", component: "Card", child: "metric-col" },
          {
            id: "metric-col",
            component: "Column",
            children: ["metric-label", "metric-value"],
          },
          { id: "metric-label", component: "Text", variant: "caption", text: { path: "label" } },
          { id: "metric-value", component: "Text", variant: "h3", text: { path: "value" } },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          heading: `Metrics view for: "${prompt}"`,
          metrics: [
            { label: "Total budget", value: "£48,200" },
            { label: "Committed", value: "£31,400" },
            { label: "Remaining", value: "£16,800" },
          ],
        },
      },
    },
  ]
}

export const CANVAS_SURFACE_ID = SURFACE_ID
