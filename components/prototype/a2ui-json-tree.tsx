"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface A2uiJsonTreeProps {
  value: unknown
  className?: string
  defaultExpandedDepth?: number
}

export function A2uiJsonTree({
  value,
  className,
  defaultExpandedDepth = 2,
}: A2uiJsonTreeProps) {
  return (
    <div className={cn("font-mono text-[11px] leading-relaxed md:text-xs", className)}>
      <JsonNode name={null} value={value} depth={0} defaultExpandedDepth={defaultExpandedDepth} />
    </div>
  )
}

interface JsonNodeProps {
  name: string | null
  value: unknown
  depth: number
  defaultExpandedDepth: number
}

function JsonNode({ name, value, depth, defaultExpandedDepth }: JsonNodeProps) {
  const [open, setOpen] = React.useState(depth < defaultExpandedDepth)
  const indent = depth * 14

  if (value === null || typeof value !== "object") {
    return (
      <div className="flex min-w-0 items-start gap-1 py-0.5" style={{ paddingLeft: indent }}>
        {name !== null ? (
          <>
            <span className="shrink-0 text-sky-400/90">&quot;{name}&quot;</span>
            <span className="text-white/30">:</span>
          </>
        ) : null}
        <PrimitiveValue value={value} />
      </div>
    )
  }

  const isArray = Array.isArray(value)
  const entries = isArray
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value as Record<string, unknown>)
  const isEmpty = entries.length === 0
  const preview = isArray ? `[${entries.length}]` : `{${entries.length}}`
  const nodeId = name ?? "root"

  return (
    <div className="min-w-0">
      <div
        className="flex min-w-0 items-start gap-1 py-0.5"
        style={{ paddingLeft: indent }}
      >
        {isEmpty ? (
          <span className="inline-block w-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <button
            type="button"
            className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white/45 hover:bg-white/[0.06] hover:text-white/75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            aria-expanded={open}
            aria-controls={`json-node-${nodeId}-${depth}`}
            aria-label={open ? `Collapse ${name ?? "root"}` : `Expand ${name ?? "root"}`}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? (
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
        )}

        {name !== null ? (
          <>
            <span className="shrink-0 text-sky-400/90">&quot;{name}&quot;</span>
            <span className="text-white/30">:</span>
          </>
        ) : null}

        {isEmpty ? (
          <span className="text-white/55">{isArray ? "[]" : "{}"}</span>
        ) : (
          <button
            type="button"
            className="truncate text-left text-white/55 hover:text-white/75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? (isArray ? "[" : "{") : preview}
          </button>
        )}
      </div>

      {!isEmpty && open ? (
        <div id={`json-node-${nodeId}-${depth}`}>
          {entries.map(([entryName, entryValue]) => (
            <JsonNode
              key={`${nodeId}-${entryName}`}
              name={entryName}
              value={entryValue}
              depth={depth + 1}
              defaultExpandedDepth={defaultExpandedDepth}
            />
          ))}
          <div className="py-0.5 text-white/55" style={{ paddingLeft: indent + 14 }}>
            {isArray ? "]" : "}"}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (typeof value === "string") {
    return <span className="break-all text-emerald-400/90">&quot;{value}&quot;</span>
  }

  if (typeof value === "number") {
    return <span className="text-amber-300/90">{value}</span>
  }

  if (typeof value === "boolean") {
    return <span className="text-violet-300/90">{String(value)}</span>
  }

  if (value === null) {
    return <span className="text-white/35">null</span>
  }

  return <span className="text-white/55">{String(value)}</span>
}
