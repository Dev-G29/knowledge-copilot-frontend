import { describe, expect, it } from 'vitest';
import { createSseParser } from './sse';

const collect = () => {
  const events = [];
  const parser = createSseParser((event) => events.push(event));
  return { events, parser };
};

describe('createSseParser', () => {
  it('parses Spring-style events with JSON data', () => {
    const { events, parser } = collect();
    parser.push('event:meta\ndata:{"conversationId":7,"sources":[]}\n\n');
    parser.push('event:token\ndata:{"text":"Hello"}\n\n');
    expect(events).toEqual([
      { event: 'meta', data: { conversationId: 7, sources: [] } },
      { event: 'token', data: { text: 'Hello' } },
    ]);
  });

  it('handles events split across arbitrary chunk boundaries', () => {
    const { events, parser } = collect();
    const stream = 'event:token\ndata:{"text":"a\\nb"}\n\nevent:done\ndata:{"conversationId":1}\n\n';
    for (const char of stream) parser.push(char);
    expect(events.map((e) => e.event)).toEqual(['token', 'done']);
    expect(events[0].data.text).toBe('a\nb');
  });

  it('supports CRLF, comments, a space after the colon and multi-line data', () => {
    const { events, parser } = collect();
    parser.push(': keep-alive\r\n\r\nevent: note\r\ndata: line one\r\ndata: line two\r\n\r\n');
    expect(events).toEqual([{ event: 'note', data: 'line one\nline two' }]);
  });

  it('flushes a trailing event without a blank line', () => {
    const { events, parser } = collect();
    parser.push('event:done\ndata:{"ok":true}');
    expect(events).toHaveLength(0);
    parser.flush();
    expect(events).toEqual([{ event: 'done', data: { ok: true } }]);
  });
});
