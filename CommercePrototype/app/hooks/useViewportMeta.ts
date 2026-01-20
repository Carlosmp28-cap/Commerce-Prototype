import { useEffect } from "react";
import { Platform } from "react-native";

const DEFAULT_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5";

function parseViewport(content: string) {
  const parts = content
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const map = new Map<string, string | true>();

  for (const part of parts) {
    const [rawKey, ...rest] = part.split("=");
    const key = rawKey?.trim().toLowerCase();
    if (!key) continue;

    if (rest.length === 0) {
      map.set(key, true);
      continue;
    }

    const value = rest.join("=").trim();
    map.set(key, value);
  }

  return map;
}

function serializeViewport(map: Map<string, string | true>) {
  const orderedKeys = [
    "width",
    "initial-scale",
    "minimum-scale",
    "maximum-scale",
    "viewport-fit",
  ];

  const used = new Set<string>();
  const parts: string[] = [];

  for (const key of orderedKeys) {
    if (!map.has(key)) continue;
    used.add(key);
    const value = map.get(key);
    parts.push(value === true ? key : `${key}=${value}`);
  }

  // Keep any remaining (unknown) keys stable-ish.
  for (const [key, value] of map.entries()) {
    if (used.has(key)) continue;
    parts.push(value === true ? key : `${key}=${value}`);
  }

  return parts.join(", ");
}

function sanitizeViewportContent(existing: string | null | undefined) {
  const content = (existing || "").trim();
  if (!content) return DEFAULT_VIEWPORT;

  const map = parseViewport(content);

  // Accessibility: never disable zoom.
  map.delete("user-scalable");

  // Ensure a reasonable maximum scale.
  const maxScale = map.get("maximum-scale");
  if (typeof maxScale === "string") {
    const parsed = Number.parseFloat(maxScale);
    if (!Number.isNaN(parsed) && parsed < 5) map.set("maximum-scale", "5");
  } else {
    map.set("maximum-scale", "5");
  }

  // Keep sane defaults if missing.
  if (!map.has("width")) map.set("width", "device-width");
  if (!map.has("initial-scale")) map.set("initial-scale", "1");
  if (!map.has("viewport-fit")) map.set("viewport-fit", "cover");

  return serializeViewport(map);
}

/**
 * Web-only: ensures the viewport meta tag allows pinch-zoom.
 * Fixes Lighthouse/Accessibility warning about `user-scalable="no"` and low `maximum-scale`.
 */
export function useViewportMeta() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof document === "undefined") return;

    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;

    if (meta) {
      const next = sanitizeViewportContent(meta.getAttribute("content"));
      meta.setAttribute("content", next);
      return;
    }

    const created = document.createElement("meta");
    created.name = "viewport";
    created.content = DEFAULT_VIEWPORT;
    document.head.appendChild(created);
  }, []);
}
