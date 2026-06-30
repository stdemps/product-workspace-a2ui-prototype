"use client"

import * as React from "react"

import {
  diffJsonLines,
  formatMessagesJson,
  summarizeDiff,
  type DiffLine,
} from "@/lib/a2ui/payload-diff"
import { cn } from "@/lib/utils"

interface A2uiPayloadDiffProps {
  before: unknown
  after: unknown
  className?: string
}

export function A2uiPayloadDiff({ before, after, className }: A2uiPayloadDiffProps) {
  const beforeText = React.useMemo(() => formatMessagesJson(before), [before])
  const afterText = React.useMemo(() => formatMessagesJson(after), [after])
  const lines = React.useMemo(() => diffJsonLines(beforeText, afterText), [beforeText, afterText])
  const summary = React.useMemo(() => summarizeDiff(lines), [lines])

  if (!summary.changed) {
    return (
      <div className={cn("rounded-lg border border-white/[0.08] bg-[#0f0f0f]/80 p-4", className)}>
        <p className="text-sm text-white/55">No changes between the previous and current payloads.</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/45 md:text-xs">
        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-medium text-emerald-400/90">
          +{summary.added}
        </span>
        <span className="rounded bg-red-500/15 px-1.5 py-0.5 font-medium text-red-400/90">
          −{summary.removed}
        </span>
        <span>previous → current</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0a0a]">
        <div className="max-h-[min(70dvh,720px)] overflow-auto">
          <pre className="min-w-max p-3 font-mono text-[11px] leading-relaxed md:p-4 md:text-xs">
            {lines.map((line, index) => (
              <DiffLineRow key={`${line.kind}-${index}`} line={line} />
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}

function DiffLineRow({ line }: { line: DiffLine }) {
  const prefix =
    line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "
  const gutter = formatGutter(line)

  return (
    <div
      className={cn(
        "flex min-w-0 gap-3 px-1",
        line.kind === "added" && "bg-emerald-500/10",
        line.kind === "removed" && "bg-red-500/10"
      )}
    >
      <span className="w-16 shrink-0 select-none text-right tabular-nums text-white/25">{gutter}</span>
      <span
        className={cn(
          "w-3 shrink-0 select-none",
          line.kind === "added" && "text-emerald-400/90",
          line.kind === "removed" && "text-red-400/90",
          line.kind === "unchanged" && "text-white/20"
        )}
      >
        {prefix}
      </span>
      <code
        className={cn(
          "min-w-0 flex-1 whitespace-pre text-white/75",
          line.kind === "added" && "text-emerald-200/90",
          line.kind === "removed" && "text-red-200/90"
        )}
      >
        {line.text || " "}
      </code>
    </div>
  )
}

function formatGutter(line: DiffLine) {
  if (line.kind === "added") {
    return line.newLineNumber ?? ""
  }

  if (line.kind === "removed") {
    return line.oldLineNumber ?? ""
  }

  return line.newLineNumber ?? ""
}
