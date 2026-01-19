import type { ImageSourcePropType } from "react-native";

export type PicsumSize = { w: number; h: number };

function resizePicsumUri(uri: string, width: number, height: number) {
  if (!uri.includes("picsum.photos/seed/")) return uri;

  // Example: https://picsum.photos/seed/sku-new-001/800/800
  // Replace the trailing /{w}/{h} while preserving any query string.
  return uri.replace(/\/(\d+)\/(\d+)(\?.*)?$/, `/${width}/${height}$3`);
}

export function createPicsumResizer() {
  const cache = new Map<string, ImageSourcePropType>();

  return function resizePicsumSource<T extends ImageSourcePropType | undefined>(
    source: T,
    width: number,
    height: number
  ): T {
    if (!source) return source;
    if (typeof source !== "object" || Array.isArray(source)) return source;

    if (!("uri" in source)) return source;
    const uri = typeof source.uri === "string" ? source.uri : undefined;
    if (!uri) return source;

    const key = `${uri}|${width}x${height}`;
    const cached = cache.get(key);
    if (cached) return cached as T;

    const updatedUri = resizePicsumUri(uri, width, height);
    const updated =
      updatedUri === uri
        ? source
        : ({ ...source, uri: updatedUri } as ImageSourcePropType);
    cache.set(key, updated);
    return updated as T;
  };
}
