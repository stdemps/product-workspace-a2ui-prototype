export type DiffLineKind = "unchanged" | "added" | "removed"

export interface DiffLine {
  kind: DiffLineKind
  text: string
  oldLineNumber: number | null
  newLineNumber: number | null
}

export function formatMessagesJson(messages: unknown): string {
  return JSON.stringify(messages, null, 2)
}

/** Myers-style line diff for pretty-printed JSON payloads. */
export function diffJsonLines(before: string, after: string): DiffLine[] {
  const oldLines = before.split("\n")
  const newLines = after.split("\n")
  const lcs = buildLcsTable(oldLines, newLines)
  const raw: Array<{ kind: DiffLineKind; text: string }> = []

  let i = oldLines.length
  let j = newLines.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      raw.push({ kind: "unchanged", text: oldLines[i - 1] })
      i -= 1
      j -= 1
      continue
    }

    if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      raw.push({ kind: "added", text: newLines[j - 1] })
      j -= 1
      continue
    }

    if (i > 0) {
      raw.push({ kind: "removed", text: oldLines[i - 1] })
      i -= 1
    }
  }

  raw.reverse()

  let oldLineNumber = 0
  let newLineNumber = 0

  return raw.map((line) => {
    if (line.kind === "unchanged") {
      oldLineNumber += 1
      newLineNumber += 1
      return {
        ...line,
        oldLineNumber,
        newLineNumber,
      }
    }

    if (line.kind === "removed") {
      oldLineNumber += 1
      return {
        ...line,
        oldLineNumber,
        newLineNumber: null,
      }
    }

    newLineNumber += 1
    return {
      ...line,
      oldLineNumber: null,
      newLineNumber,
    }
  })
}

function buildLcsTable(a: string[], b: string[]): number[][] {
  const rows = a.length + 1
  const cols = b.length + 1
  const table = Array.from({ length: rows }, () => Array<number>(cols).fill(0))

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
      }
    }
  }

  return table
}

export function summarizeDiff(lines: DiffLine[]) {
  let added = 0
  let removed = 0

  for (const line of lines) {
    if (line.kind === "added") added += 1
    if (line.kind === "removed") removed += 1
  }

  return { added, removed, changed: added + removed > 0 }
}
