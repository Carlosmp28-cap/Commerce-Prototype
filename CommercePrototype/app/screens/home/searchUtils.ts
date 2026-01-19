export function normalizeHomeSearchQuery(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}
