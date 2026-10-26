import { API_BASE_URL, notifyUnauthorized, tokenStore } from './api';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Incremental parser for the text/event-stream format. Feed it decoded chunks as they
// arrive; it calls onEvent({ event, data }) for every complete event.
export function createSseParser(onEvent) {
  let buffer = '';

  const dispatch = (block) => {
    let event = 'message';
    const dataLines = [];
    for (const line of block.split(/\r?\n/)) {
      if (!line || line.startsWith(':')) continue;
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') event = value;
      else if (field === 'data') dataLines.push(value);
    }
    if (dataLines.length === 0) return;
    const raw = dataLines.join('\n');
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
    onEvent({ event, data });
  };

  return {
    push(chunk) {
      buffer += chunk;
      let match;
      while ((match = /\r?\n\r?\n/.exec(buffer)) !== null) {
        const block = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        dispatch(block);
      }
    },
    flush() {
      if (buffer.trim()) dispatch(buffer);
      buffer = '';
    },
  };
}

// POST /chat/stream. EventSource can't send a body or an Authorization header, so this
// reads the response stream with fetch instead. Resolves when the stream ends.
export async function streamChat({ query, conversationId, signal, onEvent }) {
  const token = tokenStore.get();
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, conversationId: conversationId ?? null }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) notifyUnauthorized();
    let message = 'The assistant is unavailable right now. Please try again.';
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(response.status, message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = createSseParser(onEvent);

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    parser.push(decoder.decode(value, { stream: true }));
  }
  parser.push(decoder.decode());
  parser.flush();
}
