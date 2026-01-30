import React, { useEffect, useState } from "react";
import { View, Text, useWindowDimensions, Platform } from "react-native";
import styles from "./styles";
import MapCanvas from "./components/MapCanvas";
import ZoneCard, { Zone as ZoneType, Shelf as ShelfType } from "./components/ZoneCard";
import DirectionsCard from "./components/DirectionsCard";
import SelectorsBar from "./components/SelectorsBar";

// Types
type Store = {
  storeId: string;
  gridDimensions: { width: number; height: number; unit?: string };
};
// Reuse shared types
type Shelf = ShelfType;
type Zone = ZoneType;

interface Props {
  storeId: string;
  containerWidth?: number;
  containerHeight?: number;
  showGrid?: boolean;
  path?: { x: number; y: number }[];
  baseUrl?: string;
}

export default function StoreMap({
  storeId,
  containerWidth = 1200,
  containerHeight = 900,
  showGrid = true,
  path,
  baseUrl = "http://localhost:5035/api/StoreLayout/map",
}: Props) {
  const [store, setStore] = useState<Store | null>(null);
  const { width: winW, height: winH } = useWindowDimensions();
  const [selectorH, setSelectorH] = useState(0);
  const [infoH, setInfoH] = useState(0);
  // Responsive behavior: on native (tablet/phone) with narrower widths, stack the panel below the map
  const stackOnNative = Platform.OS !== 'web' && winW < 980;
  // explicit sizing for the map container
  // reserve ~340px for the side panel + margins (0 when stacked)
  const sidePanelReserve = stackOnNative ? 0 : 340;
  const horizontalGutters = 40; // paddings/margins around content
  const verticalGutters = 64;   // paddings between sections
  // Use safe estimates before actual onLayout measurements arrive
  const estimatedSelectorH = selectorH || 96;
  const estimatedInfoH = infoH || 56;
  const bottomSafeSpace = 48;
  const mapWidth = Math.max(
    700,
    Math.min(
      containerWidth,
      Math.max(320, winW - sidePanelReserve - horizontalGutters)
    ),
  );
  const mapHeight = Math.max(
    550,
    Math.min(
      containerHeight,
      Math.max(
        320,
        winH - estimatedSelectorH - estimatedInfoH - verticalGutters - bottomSafeSpace
      )
    ),
  );

  const [shelvesAll, setShelvesAll] = useState<any[]>([]);
  const [zonesAll, setZonesAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // allow internal selection of store (defaults to prop)
  const [currentStoreId, setCurrentStoreId] = useState<string>(storeId);
  // store dropdown search
  const [storeSearch, setStoreSearch] = useState<string>("");
  const [showStoreDropdown, setShowStoreDropdown] = useState<boolean>(false);
  // keep simple static list for now (knownStores declared below)
  const knownStores = ["LISBOA01", "PORTO01", "COIMBRA01"];

  // products dropdown
  const [productsAll, setProductsAll] = useState<
    { productId: string; name?: string }[]
  >([]);
  const [productSearch, setProductSearch] = useState<string>("");
  const [showProductDropdown, setShowProductDropdown] =
    useState<boolean>(false);

  // visual scale used to make shelves more prominent (fixed)
  const shelfDisplayScale = 1.0;
  // selected zone for details panel
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  // product->shelf mappings loaded on demand from backend (if available)
  const [productZones, setProductZones] = useState<
    | {
        productId: string;
        shelfId: string;
        zoneId?: string;
        productName?: string;
      }[]
    | null
  >(null);
  const baseApi = baseUrl.replace(/\/map$/, "");
  const productsApiRoot = baseUrl.replace(/\/StoreLayout\/map$/, "");

  // Fetch products when dropdown opens or when the user types; also fetch all products when
  // dropdown opens with empty input so the list is always available.
  // Load product list from backend mockData (local JSON) instead of calling the
  // public products API which serves a different purpose.
  useEffect(() => {
    try {
      const data = require("../../../CommercePrototype-Backend/mockData/products.json");
      const hits = data.products ?? data ?? [];
      const mapped = (hits || [])
        .map((p: any) => ({
          productId: p.productId ?? p.id ?? p.sku ?? p.ID ?? "",
          name:
            p.name ?? p.productName ?? p.title ?? p.displayName ?? undefined,
          category: p.category ?? p.Category ?? p.productCategory ?? undefined,
        }))
        .filter((x: any) => x.productId);
      if (mapped.length > 0) setProductsAll(mapped);
    } catch (err) {
      console.warn("Failed to load local mock products", err);
    }
  }, []);

  // route request state
  const [productId, setProductId] = useState<string>("SKU001234");
  const [startX, setStartX] = useState<string>("0");
  const [startY, setStartY] = useState<string>("0");
  const [routePath, setRoutePath] = useState<{ x: number; y: number }[]>([]);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [directions, setDirections] = useState<any[] | null>(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(false);

  // Auto-load product->shelf mappings when a zone is selected (if not already loaded)
  useEffect(() => {
    let mounted = true;
    async function loadProductZonesIfNeeded() {
      if (!selectedZone) return;
      if (productZones !== null) return; // already loaded or attempted
      try {
        const url = `${baseApi}/product-zones?storeId=${encodeURIComponent(currentStoreId)}`;
        const res = await fetch(url);
        if (!res.ok)
          throw new Error(`Product-zones not available (${res.status})`);
        const data = await res.json();
        if (!mounted) return;
        setProductZones(data);
        // merge any product names returned by product-zones into the products dropdown
        try {
          const newProducts: { productId: string; name?: string }[] = (
            data || []
          ).map((p: any) => ({
            productId: p.productId,
            name: p.productName ?? undefined,
          }));
          setProductsAll((prev) => {
            const map = new Map(prev.map((item) => [item.productId, item]));
            newProducts.forEach((np: { productId: string; name?: string }) => {
              const existing = map.get(np.productId);
              if (!existing) map.set(np.productId, np);
              else if (!existing.name && np.name) map.set(np.productId, np);
            });
            return Array.from(map.values());
          });
        } catch (err) {
          console.warn("Error merging product names", err);
        }
      } catch (e) {
        console.warn("Failed to load product-zones", e);
        if (!mounted) return;
        setProductZones([]);
      }
    }
    loadProductZonesIfNeeded();
    return () => {
      mounted = false;
    };
  }, [selectedZone, currentStoreId, baseApi, productZones]);

  // Also preload product-zones when the product dropdown opens so we can show
  // the list of available products for the current store (even when no zone selected).
  useEffect(() => {
    let mounted = true;
    async function preloadProductZones() {
      if (!showProductDropdown) return;
      if (productZones !== null) return; // already loaded or attempted
      try {
        const url = `${baseApi}/product-zones?storeId=${encodeURIComponent(currentStoreId)}`;
        const res = await fetch(url);
        if (!res.ok)
          throw new Error(`Product-zones not available (${res.status})`);
        const data = await res.json();
        if (!mounted) return;
        setProductZones(data);
        // merge any product names returned by product-zones into the products dropdown
        try {
          const newProducts: { productId: string; name?: string }[] = (
            data || []
          ).map((p: any) => ({
            productId: p.productId,
            name: p.productName ?? undefined,
          }));
          setProductsAll((prev) => {
            const map = new Map(prev.map((item) => [item.productId, item]));
            newProducts.forEach((np: { productId: string; name?: string }) => {
              const existing = map.get(np.productId);
              if (!existing) map.set(np.productId, np);
              else if (!existing.name && np.name) map.set(np.productId, np);
            });
            return Array.from(map.values());
          });
        } catch (err) {
          console.warn("Error merging product names (preload)", err);
        }
      } catch (e) {
        console.warn("Failed to preload product-zones", e);
        if (!mounted) return;
        setProductZones([]);
      }
    }
    preloadProductZones();
    return () => {
      mounted = false;
    };
  }, [showProductDropdown, currentStoreId, baseApi, productZones]);

  // initialize products from mock data

  useEffect(() => {
    let mounted = true;
    async function fetchLayout() {
      setLoading(true);
      setError(null);
      try {
        const url = `${baseUrl}/${encodeURIComponent(currentStoreId)}`;
        const res = await fetch(url);
        if (!res.ok)
          throw new Error(`Failed to fetch store layout: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        // controller may return capitalized or lowercase keys depending on server serializer
        // handle both: { StoreId, Zones, Shelves, Dimensions } and { storeId, zones, shelves, dimensions }
        setShelvesAll(data.Shelves ?? data.shelves ?? []);
        setZonesAll(data.Zones ?? data.zones ?? []);
        const dims = data.Dimensions ?? data.dimensions ?? {};
        setStore({
          storeId: data.StoreId ?? data.storeId ?? currentStoreId,
          gridDimensions: dims ?? {},
        });
      } catch (ex: any) {
        if (!mounted) return;
        setError(ex?.message ?? String(ex));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLayout();
    return () => {
      mounted = false;
    };
  }, [currentStoreId, baseUrl]);

  if (loading) return <Text>Loading map...</Text>;
  if (error) return <Text>Error loading map: {error}</Text>;

  const currentStore: Store | null = store;
  if (!currentStore) return <Text>Store not found</Text>;

  const shelves: Shelf[] = (shelvesAll || []).map((s: any) => ({
    id: s.Id ?? s.id,
    storeId: currentStoreId,
    zoneId: s.ZoneId ?? s.zoneId ?? s.Zone ?? s.zone ?? undefined,
    x: s.X ?? s.x ?? s.Position?.X ?? s.Position?.x ?? 0,
    y: s.Y ?? s.y ?? s.Position?.Y ?? s.Position?.y ?? 0,
    width: s.Width ?? s.width ?? 1,
    height: s.Height ?? s.height ?? 1,
  }));
  const zones: Zone[] = (zonesAll || []).map((z: any) => ({
    storeId: currentStoreId,
    zoneId: z.ZoneId ?? z.zoneId ?? z.Id ?? z.id,
    zoneName: z.ZoneName ?? z.zoneName ?? z.Name ?? z.name ?? undefined,
    x: z.X ?? z.x ?? z.Position?.X ?? z.Position?.x ?? 0,
    y: z.Y ?? z.y ?? z.Position?.Y ?? z.Position?.y ?? 0,
    width: z.Width ?? z.width ?? 1,
    height: z.Height ?? z.height ?? 1,
    category: z.Category ?? z.category ?? undefined,
  }));

  const storeW = currentStore.gridDimensions?.width ?? 10;
  const storeH = currentStore.gridDimensions?.height ?? 10;

  // Use SVG viewBox in store units so the SVG scales to fill container keeping coordinates in meters
  // const toPx = (v: number) => v; // removed unused

  // stronger, more saturated colors for zones (moved inside MapCanvas)
  // const zoneColors = ["#ff5252", "#00c853", "#2979ff", "#ffd600", "#7c4dff", "#00bfa5", "#ff8a50"]; // removed unused

  // mapWidth and mapHeight computed near the top using window and reserved panel space

  // prefer routePath (from backend) but fall back to prop 'path' if provided
  const drawnPath =
    routePath && routePath.length > 0 ? routePath : (path ?? []);

  // map drawnPath to rendering coordinates: if points look like integer grid indices, render at cell centers
  const resNum = 1; // fixed grid resolution
  const mappedPath = drawnPath.map((p) => {
    const isIntX = Math.abs(p.x - Math.round(p.x)) < 1e-6;
    const isIntY = Math.abs(p.y - Math.round(p.y)) < 1e-6;
    if (isIntX && isIntY) {
      return { x: p.x + 0.5 * resNum, y: p.y + 0.5 * resNum };
    }
    return p;
  });

  // compute start position mapped to rendering coordinates (same logic used for path points)
  const parsedStartX = parseFloat(startX) || 0;
  const parsedStartY = parseFloat(startY) || 0;
  const startIsIntX = Math.abs(parsedStartX - Math.round(parsedStartX)) < 1e-6;
  const startIsIntY = Math.abs(parsedStartY - Math.round(parsedStartY)) < 1e-6;
  const startMapped =
    startIsIntX && startIsIntY
      ? { x: parsedStartX + 0.5 * resNum, y: parsedStartY + 0.5 * resNum }
      : { x: parsedStartX, y: parsedStartY };

  // Client-side grid dimensions and helper for debug overlay
  const gridCols = Math.max(1, Math.ceil(storeW));
  const gridRows = Math.max(1, Math.ceil(storeH));
  const gridResolution = 1;
  const isCellBlockedLocal = (sx: number, sy: number) => {
    for (const s of shelves) {
      const origX0 = s.x - s.width / 2.0;
      const origY0 = s.y - s.height / 2.0;
      const origX1 = s.x + s.width / 2.0;
      const origY1 = s.y + s.height / 2.0;
      let shelfX0 = origX0;
      let shelfY0 = origY0;
      let shelfX1 = origX1;
      let shelfY1 = origY1;
      const shrink = 0.1;
      if (shelfX1 - shelfX0 > 2.0 * shrink) {
        shelfX0 += shrink;
        shelfX1 -= shrink;
      }
      if (shelfY1 - shelfY0 > 2.0 * shrink) {
        shelfY0 += shrink;
        shelfY1 -= shrink;
      }
      const gx0Shelf = Math.max(
        0,
        Math.min(gridCols - 1, Math.floor(shelfX0 / gridResolution)),
      );
      const gy0Shelf = Math.max(
        0,
        Math.min(gridRows - 1, Math.floor(shelfY0 / gridResolution)),
      );
      const gx1Shelf = Math.max(
        0,
        Math.min(gridCols - 1, Math.floor(shelfX1 / gridResolution)),
      );
      const gy1Shelf = Math.max(
        0,
        Math.min(gridRows - 1, Math.floor(shelfY1 / gridResolution)),
      );
      if (sx >= gx0Shelf && sx <= gx1Shelf && sy >= gy0Shelf && sy <= gy1Shelf)
        return true;
    }
    return false;
  };

  const clientGrid = Array.from({ length: gridCols }, () => Array(gridRows).fill(true));
  for (let gx = 0; gx < gridCols; gx++) {
    for (let gy = 0; gy < gridRows; gy++) {
      clientGrid[gx][gy] = !isCellBlockedLocal(gx, gy);
    }
  }
  const startIdxX = Math.max(
    0,
    Math.min(gridCols - 1, Math.floor(startMapped.x / gridResolution)),
  );
  const startIdxY = Math.max(
    0,
    Math.min(gridCols - 1, Math.floor(startMapped.y / gridResolution)),
  );

  // Determine which products to show in the dropdown:
  // - Use `productsAll` if available
  // - If a zone is selected and `productZones` is loaded, restrict to products mapped to that zone
  // - If no productsAll but productZones contain entries for the zone, show those ids

  const computeDisplayedProducts = () => {
    const base =
      productsAll.length > 0
        ? productsAll
        : productId
          ? [{ productId, name: undefined }]
          : [];

    const hasSelection = Boolean(productId);

    // If user hasn't selected a product and no zone is selected, prefer showing
    // products available in this store (from productZones). Otherwise fall back
    // to the global `productsAll` list.
    if (!selectedZone && !hasSelection) {
      if (
        productZones &&
        Array.isArray(productZones) &&
        productZones.length > 0
      ) {
        const forStore = (productZones || []).filter(
          (pz: any) => !pz.storeId || pz.storeId === currentStoreId,
        );
        const ids = Array.from(new Set(forStore.map((m: any) => m.productId)));
        const fromBase = base.filter((p: any) => ids.includes(p.productId));
        if (fromBase.length > 0) return fromBase;
        return ids.map((pid) => {
          const mapping = forStore.find((m: any) => m.productId === pid);
          return { productId: pid, name: mapping?.productName ?? undefined };
        });
      }
      return base.slice();
    }

    // If a zone is selected, use zone-scoped logic (existing behavior)
    // If productZones not loaded, fall back to base
    if (!selectedZone || !productZones || !Array.isArray(productZones))
      return base;

    const zoneId = selectedZone.zoneId;

    const shelfIdsInZone = new Set(
      shelves.filter((sh) => sh.zoneId === zoneId).map((s) => s.id),
    );

    const mappingsForZone = (productZones || []).filter((pz: any) => {
      const sameStore = !pz.storeId || pz.storeId === currentStoreId;
      const sameZone = (pz.zoneId ?? pz.zone) === zoneId;
      const shelfInZone = shelfIdsInZone.has(pz.shelfId ?? pz.shelf);
      return sameStore && (sameZone || shelfInZone);
    });

    const ids = new Set((mappingsForZone || []).map((m: any) => m.productId));

    if (ids.size > 0) {
      const fromBase = base.filter((p: any) => ids.has(p.productId));
      if (fromBase.length > 0) return fromBase;
      return Array.from(ids).map((pid) => {
        const mapping = mappingsForZone.find((m: any) => m.productId === pid);
        return { productId: pid, name: mapping?.productName ?? undefined };
      });
    }

    if (selectedZone?.category) {
      const zcat = (selectedZone.category || "").toLowerCase();
      const foundByCat = base.filter((p: any) => {
        const pc = (p.category ?? "").toLowerCase();
        const pn = (p.name ?? "").toLowerCase();
        return (pc && pc.includes(zcat)) || (pn && pn.includes(zcat));
      });
      if (foundByCat.length > 0) return foundByCat;
    }

    return base;
  };

  // Helper: render a human-friendly Portuguese direction from the server-provided step
  const formatDirectionSentence = (d: any, idx: number) => {
    const txt = (d.summary ?? d.text ?? d.instruction ?? "").toString();
    const dist = d.distanceMeters ?? d.distance ?? null;
    const area = d.area ?? d.zone ?? d.zoneName ?? d.target ?? null;
    const via = (d.via ?? d.viaName ?? "").toString();
    const entranceHint = /entrada|entrance|door|porta/i.test(txt + " " + via) ? "pela entrada" : "";

    // If server provided actionable text with distance, use it
    if (dist != null && txt) {
      const distRound = Math.round(Number(dist));
      // If txt already contains a direction keyword, keep it
      if (/direita|esquerda|cima|baixo|frente/i.test(txt)) {
        return txt.startsWith("Ande") ? txt : `Ande ${distRound} m — ${txt}`;
      }
      // prefer destination hint only as suffix, but focus on movement
      const suffix = area ? ` até a área ${area}` : "";
      return `Ande ${distRound} m — ${txt}${suffix}`.trim();
    }
    // If only distance+area, it is not very helpful; fallback to geometric derivation below
    if (dist != null && area && !txt) {
      const distRound = Math.round(Number(dist));
      return `Ande ${distRound} m ${entranceHint} até a área ${area}`.trim();
    }
    if (txt) return txt;
    if (area) return `Dirija-se à área ${area}`;
    return `Passo ${idx + 1}`;
  };

  const displayedProducts = computeDisplayedProducts();

  const handleGetRoute = async () => {
    setRouteLoading(true);
    try {
      const sxNum = parseFloat(startX) || 0;
      const syNum = parseFloat(startY) || 0;
      const startIsIntXLocal = Math.abs(sxNum - Math.round(sxNum)) < 1e-6;
      const startIsIntYLocal = Math.abs(syNum - Math.round(syNum)) < 1e-6;
      const startPosX = startIsIntXLocal ? sxNum + 0.5 : sxNum;
      const startPosY = startIsIntYLocal ? syNum + 0.5 : syNum;

      const gridResolution = 1;
      const cols = Math.max(1, Math.ceil(storeW));
      const rows = Math.max(1, Math.ceil(storeH));
      const isCellBlocked = (sx: number, sy: number) => {
        for (const s of shelves) {
          const origX0 = s.x - s.width / 2.0;
          const origY0 = s.y - s.height / 2.0;
          const origX1 = s.x + s.width / 2.0;
          const origY1 = s.y + s.height / 2.0;
          let shelfX0 = origX0; let shelfY0 = origY0; let shelfX1 = origX1; let shelfY1 = origY1;
          const shrink = 0.1;
          if (shelfX1 - shelfX0 > 2.0 * shrink) { shelfX0 += shrink; shelfX1 -= shrink; }
          if (shelfY1 - shelfY0 > 2.0 * shrink) { shelfY0 += shrink; shelfY1 -= shrink; }
          const gx0Shelf = Math.max(0, Math.min(cols - 1, Math.floor(shelfX0 / gridResolution)));
          const gy0Shelf = Math.max(0, Math.min(rows - 1, Math.floor(shelfY0 / gridResolution)));
          const gx1Shelf = Math.max(0, Math.min(cols - 1, Math.floor(shelfX1 / gridResolution)));
          const gy1Shelf = Math.max(0, Math.min(rows - 1, Math.floor(shelfY1 / gridResolution)));
          if (sx >= gx0Shelf && sx <= gx1Shelf && sy >= gy0Shelf && sy <= gy1Shelf) return true;
        }
        return false;
      };
      const clientGridLocal = Array.from({ length: cols }, () => Array(rows).fill(true));
      for (let gx = 0; gx < cols; gx++) {
        for (let gy = 0; gy < rows; gy++) {
          clientGridLocal[gx][gy] = !isCellBlocked(gx, gy);
        }
      }
      let sPx = startPosX; let sPy = startPosY;
      const startIdxXLocal = Math.max(0, Math.min(cols - 1, Math.floor(sPx / gridResolution)));
      const startIdxYLocal = Math.max(0, Math.min(rows - 1, Math.floor(sPy / gridResolution)));
      if (isCellBlocked(startIdxXLocal, startIdxYLocal)) {
        const visited = Array.from({ length: cols }, () => Array(rows).fill(false));
        const q: { x: number; y: number }[] = [];
        q.push({ x: startIdxXLocal, y: startIdxYLocal });
        visited[startIdxXLocal][startIdxYLocal] = true;
        let found: { x: number; y: number } | null = null;
        while (q.length > 0) {
          const cur = q.shift()!;
          const neigh = [ { x: cur.x + 1, y: cur.y }, { x: cur.x - 1, y: cur.y }, { x: cur.x, y: cur.y + 1 }, { x: cur.x, y: cur.y - 1 } ];
          for (const n of neigh) {
            if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows) continue;
            if (visited[n.x][n.y]) continue;
            visited[n.x][n.y] = true;
            if (!isCellBlocked(n.x, n.y)) { found = n; q.length = 0; break; }
            q.push(n);
          }
        }
        if (found) {
          sPx = found.x + 0.5 * gridResolution; sPy = found.y + 0.5 * gridResolution;
        }
      }

      const sendRequest = async (bodyObj: any) => {
        const apiRoot = productsApiRoot || 'http://localhost:5035/api';
        try {
          const dirRes = await fetch(`${apiRoot}/routes/instructions/directions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj) });
          if (dirRes.ok) { const json = await dirRes.json(); return { path: json.Path ?? json.path ?? null, dirs: json.Directions ?? json.directions ?? null }; }
        } catch (e) { console.warn('Directions endpoint failed, falling back', e); }
        try {
          const res = await fetch(`${apiRoot}/routes/instructions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj) });
          if (!res.ok) { console.warn('Route request failed status:', res.status); return { path: null, dirs: null }; }
          const json = await res.json();
          return { path: json.Path ?? json.path ?? null, dirs: json.Directions ?? json.directions ?? null };
        } catch (e) { console.warn('Route request error', e); return { path: null, dirs: null }; }
      };

      let latestDirs: any[] | null = null; let pathResponse: any[] | null = null;
      const initial = await sendRequest({ StoreId: currentStoreId, ProductId: productId, StartPosition: { X: sPx, Y: sPy }, GridResolutionMeters: 1 });
      if (initial) { pathResponse = initial.path; latestDirs = initial.dirs ?? null; }
      if (!pathResponse || pathResponse.length === 0) {
        const sx0 = Math.max(0, Math.min(cols - 1, Math.floor(sPx / gridResolution)));
        const sy0 = Math.max(0, Math.min(rows - 1, Math.floor(sPy / gridResolution)));
        const maxRadius = Math.max(cols, rows);
        let foundPath: any[] | null = null;
        outer: for (let r = 1; r <= Math.min(10, maxRadius); r++) {
          for (let dx = -r; dx <= r; dx++) {
            const dy = r - Math.abs(dx);
            const candidates = [ { x: sx0 + dx, y: sy0 + dy }, { x: sx0 + dx, y: sy0 - dy } ];
            for (const c of candidates) {
              if (c.x < 0 || c.x >= cols || c.y < 0 || c.y >= rows) continue;
              if (isCellBlocked(c.x, c.y)) continue;
              const tryBody = { StoreId: currentStoreId, ProductId: productId, StartPosition: { X: c.x + 0.5 * gridResolution, Y: c.y + 0.5 * gridResolution }, GridResolutionMeters: 1 };
              const p = await sendRequest(tryBody);
              if (p && p.path && p.path.length > 0) { foundPath = p.path; latestDirs = p.dirs ?? null; break outer; }
            }
          }
        }
        if (foundPath) pathResponse = foundPath;
      }
      setRoutePath(pathResponse ?? []);
      setDirections(latestDirs ?? null);
    } catch (err: any) {
      console.error("Route request error", err);
      setRoutePath([]);
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <View style={styles.fullContainer}>
      <View style={styles.selectorRow} onLayout={(e) => setSelectorH(Math.round(e.nativeEvent.layout.height))}>
        <SelectorsBar
          knownStores={knownStores}
          storeSearch={storeSearch}
          setStoreSearch={setStoreSearch}
          showStoreDropdown={showStoreDropdown}
          setShowStoreDropdown={setShowStoreDropdown}
          currentStoreId={currentStoreId}
          setCurrentStoreId={(s) => { setCurrentStoreId(s); setProductsAll([]); setSelectedZone(null); setProductZones(null); setRoutePath([]); setStartX('0'); setStartY('0'); }}
          productsAll={productsAll}
          displayedProducts={displayedProducts}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          showProductDropdown={showProductDropdown}
          setShowProductDropdown={setShowProductDropdown}
          productId={productId}
          setProductId={setProductId}
          productZones={productZones}
          shelves={shelves}
          zones={zones}
          setSelectedZone={setSelectedZone as any}
          startX={startX}
          setStartX={setStartX}
          startY={startY}
          setStartY={setStartY}
          routeLoading={routeLoading}
          onGetRoute={handleGetRoute}
          onClear={() => { setRoutePath([]); setDirections(null); }}
          showDebugOverlay={showDebugOverlay}
          setShowDebugOverlay={setShowDebugOverlay}
        />
      </View>

      {(showStoreDropdown || showProductDropdown) && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90000 }} onStartShouldSetResponder={() => true} onResponderRelease={() => { setShowStoreDropdown(false); setShowProductDropdown(false); }} />
      )}

      <View style={[
        styles.mapRow,
        {
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          paddingVertical: 12,
          flexDirection: stackOnNative ? 'column' : 'row'
        }
      ] }>
        <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}> 
          <MapCanvas
            storeW={storeW}
            storeH={storeH}
            containerWidth={mapWidth}
            containerHeight={mapHeight}
            zones={zones}
            shelves={shelves}
            shelfDisplayScale={shelfDisplayScale}
            selectedZone={selectedZone}
            setSelectedZone={(z: Zone) => setSelectedZone(z)}
            mappedPath={mappedPath}
            resNum={resNum}
            startMapped={startMapped}
            showDebugOverlay={showDebugOverlay}
            clientGrid={clientGrid}
            gridCols={gridCols}
            gridRows={gridRows}
            startIdxX={startIdxX}
            startIdxY={startIdxY}
          />
         </View>

        <View style={[
          styles.sidePanel,
          stackOnNative
            ? { width: '100%', maxWidth: '100%', marginRight: 0, marginTop: 12 }
            : { marginTop: 0, gap: 12 }
        ] }>
          {!selectedZone ? (
            <Text style={{ margin: 8 }}>Clique numa zona para ver detalhes</Text>
          ) : (
            <ZoneCard
              selectedZone={selectedZone}
              onClose={() => setSelectedZone(null)}
              shelves={shelves}
              zones={zones}
              baseApi={baseApi}
              currentStoreId={currentStoreId}
              productZones={productZones}
              setProductZones={(pz) => setProductZones(pz)}
              productsAll={productsAll}
              setProductId={setProductId}
              setProductSearch={setProductSearch}
              setShowProductDropdown={setShowProductDropdown}
              setSelectedZone={(z) => setSelectedZone(z)}
            />
          )}

          {/* Directions separated into its own card as requested */}
          <DirectionsCard directions={directions} formatDirectionSentence={formatDirectionSentence} />
        </View>
      </View>

      <View style={[styles.infoRow, { marginTop: 8 }]} onLayout={(e) => setInfoH(Math.round(e.nativeEvent.layout.height))}>
        <Text>Store: {currentStoreId}</Text>
      </View>
    </View>
  );
}

// styles moved to ./styles.ts
