export type ChatEvent =
  | { type: 'thinking' }
  | { type: 'evidence'; ids: string[] }
  | { type: 'accepted'; message_id: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; message_id: string; text: string }
  | { type: 'error'; detail: string; saved: boolean }

/** NDJSON records can span network chunks, including inside a UTF-8 character. */
export async function readChatStream(response: Response, onEvent: (event: ChatEvent) => void) {
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(typeof body?.detail === 'string' ? body.detail : `Request failed (${response.status})`)
  }
  if (!response.body) throw new Error('Streaming is unavailable in this browser.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false
  const consume = (line: string) => {
    if (!line.trim()) return
    const event = JSON.parse(line) as ChatEvent
    onEvent(event)
    if (event.type === 'error') throw new Error(event.detail)
    if (event.type === 'done') completed = true
  }
  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      let newline: number
      while ((newline = buffer.indexOf('\n')) !== -1) {
        consume(buffer.slice(0, newline))
        buffer = buffer.slice(newline + 1)
      }
      if (done) break
    }
    consume(buffer)
    if (!completed) throw new Error('Connection ended before the reply completed. Reload the discussion before retrying.')
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}

export async function sendChatStream(id: string, text: string, onEvent: (event: ChatEvent) => void, signal: AbortSignal) {
  const response = await fetch(`/api/matches/${encodeURIComponent(id)}/discussion/stream`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }), signal,
  })
  await readChatStream(response, onEvent)
}
