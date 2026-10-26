const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function formatRelative(value) {
  if (!value) return '';
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  if (abs < 3600) return relativeFormatter.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return relativeFormatter.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86400) return relativeFormatter.format(Math.round(seconds / 86400), 'day');
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

// Groups conversations for the sidebar: Today / Yesterday / Previous 7 days / Older.
export function groupByRecency(conversations) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const day = 86400000;
  const groups = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 days', items: [] },
    { label: 'Older', items: [] },
  ];
  for (const conversation of conversations) {
    const time = new Date(conversation.updatedAt || conversation.createdAt).getTime();
    if (time >= startOfToday.getTime()) groups[0].items.push(conversation);
    else if (time >= startOfToday.getTime() - day) groups[1].items.push(conversation);
    else if (time >= startOfToday.getTime() - 7 * day) groups[2].items.push(conversation);
    else groups[3].items.push(conversation);
  }
  return groups.filter((group) => group.items.length > 0);
}

// Retrieval confidence is the mean cosine similarity of the chunks used (0..1).
export function describeConfidence(score) {
  if (score == null || Number.isNaN(score)) return null;
  if (score >= 0.7) return { label: 'High match', tone: 'success' };
  if (score >= 0.5) return { label: 'Good match', tone: 'primary' };
  return { label: 'Weak match', tone: 'warning' };
}

export const plural = (count, word) => `${count.toLocaleString()} ${word}${count === 1 ? '' : 's'}`;

export function fileKind(name = '') {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.txt')) return 'TXT';
  return 'FILE';
}
