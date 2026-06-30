export function formatSseEvent(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export function createSseStream(
  writeEvents: (write: (payload: Record<string, unknown>) => void) => Promise<void>
) {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const write = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(formatSseEvent(payload)))
      }

      try {
        await writeEvents(write)
      } catch (error) {
        console.error("SSE stream error:", error)
        write({
          type: "RUN_ERROR",
          message: error instanceof Error ? error.message : "Unknown stream error",
        })
      } finally {
        controller.close()
      }
    },
  })
}
