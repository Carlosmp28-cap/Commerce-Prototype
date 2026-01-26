import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Svg, { Rect, G, Polyline, Polygon, Defs, LinearGradient, Stop, Text as SvgText, Circle } from 'react-native-svg';

// Types
type Store = { storeId: string; gridDimensions: { width: number; height: number; unit?: string } };
type Shelf = { id: string; storeId: string; zoneId?: string; x: number; y: number; width: number; height: number };
type Zone = { storeId: string; zoneId: string; zoneName?: string; x: number; y: number; width: number; height: number };

interface Props {
  storeId: string;
  containerWidth?: number;
  containerHeight?: number;
  showGrid?: boolean;
  path?: { x: number; y: number }[];
  baseUrl?: string;
}

export default function StoreMap({ storeId, containerWidth = 360, containerHeight = 360, showGrid = true, path, baseUrl = 'http://localhost:5035/api/StoreLayout/map' }: Props) {
  const [store, setStore] = useState<Store | null>(null);
  const [shelvesAll, setShelvesAll] = useState<any[]>([]);
  const [zonesAll, setZonesAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // allow internal selection of store (defaults to prop)
  const [currentStoreId, setCurrentStoreId] = useState<string>(storeId);
  // store dropdown search
  const [storeSearch, setStoreSearch] = useState<string>('');
  const [showStoreDropdown, setShowStoreDropdown] = useState<boolean>(false);
  // keep simple static list for now (knownStores declared below)
  const knownStores = ['LISBOA01', 'PORTO01', 'COIMBRA01'];

  // products dropdown
  const [productsAll, setProductsAll] = useState<{ productId: string; name?: string }[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [showProductDropdown, setShowProductDropdown] = useState<boolean>(false);

  // visual scale used to make shelves more prominent (fixed)
  const shelfDisplayScale = 1.0;
  // selected zone for details panel
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  // product->shelf mappings loaded on demand from backend (if available)
  const [productZones, setProductZones] = useState<{ productId: string; shelfId: string; zoneId?: string; productName?: string }[] | null>(null);
  const baseApi = baseUrl.replace(/\/map$/, '');

  // route request state
  const [productId, setProductId] = useState<string>('SKU001234');
  const [startX, setStartX] = useState<string>('0');
  const [startY, setStartY] = useState<string>('0');
  const [routePath, setRoutePath] = useState<{ x: number; y: number }[]>([]);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);

  // Auto-load product->shelf mappings when a zone is selected (if not already loaded)
  useEffect(() => {
    let mounted = true;
    async function loadProductZonesIfNeeded() {
      if (!selectedZone) return;
      if (productZones !== null) return; // already loaded or attempted
      try {
        const url = `${baseApi}/product-zones?storeId=${encodeURIComponent(currentStoreId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Product-zones not available (${res.status})`);
        const data = await res.json();
        if (!mounted) return;
        setProductZones(data);
        // merge any product names returned by product-zones into the products dropdown
        try {
          const newProducts: { productId: string; name?: string }[] = (data || []).map((p: any) => ({ productId: p.productId, name: p.productName ?? undefined }));
          setProductsAll(prev => {
            const map = new Map(prev.map(item => [item.productId, item]));
            newProducts.forEach((np: { productId: string; name?: string }) => {
              const existing = map.get(np.productId);
              if (!existing) map.set(np.productId, np);
              else if (!existing.name && np.name) map.set(np.productId, np);
            });
            return Array.from(map.values());
          });
        } catch (err) {
          console.warn('Error merging product names', err);
        }
      } catch (e) {
        console.warn('Failed to load product-zones', e);
        if (!mounted) return;
        setProductZones([]);
      }
    }
    loadProductZonesIfNeeded();
    return () => { mounted = false; };
  }, [selectedZone, currentStoreId, baseApi, productZones]);

  // initialize products from mock data

  useEffect(() => {
    let mounted = true;
    async function fetchLayout() {
      setLoading(true);
      setError(null);
      try {
        const url = `${baseUrl}/${encodeURIComponent(currentStoreId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch store layout: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        // controller may return capitalized or lowercase keys depending on server serializer
        // handle both: { StoreId, Zones, Shelves, Dimensions } and { storeId, zones, shelves, dimensions }
        setShelvesAll(data.Shelves ?? data.shelves ?? []);
        setZonesAll(data.Zones ?? data.zones ?? []);
        const dims = data.Dimensions ?? data.dimensions ?? {};
        setStore({ storeId: data.StoreId ?? data.storeId ?? currentStoreId, gridDimensions: dims ?? {} });
      } catch (ex: any) {
        if (!mounted) return;
        setError(ex?.message ?? String(ex));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLayout();
    return () => { mounted = false; };
  }, [currentStoreId, baseUrl]);

  if (loading) return <Text>Loading map...</Text>;
  if (error) return <Text>Error loading map: {error}</Text>;

  // Use single `store` state set by the fetch
  const currentStore: Store | null = store;

  const shelves: Shelf[] = (shelvesAll || []).map((s: any) => ({
    id: s.Id ?? s.id,
    storeId: currentStoreId,
    zoneId: s.ZoneId ?? s.zoneId ?? s.Zone ?? s.zone ?? undefined,
    x: s.X ?? s.x ?? s.Position?.X ?? s.Position?.x ?? 0,
    y: s.Y ?? s.y ?? s.Position?.Y ?? s.Position?.y ?? 0,
    width: s.Width ?? s.width ?? 1,
    height: s.Height ?? s.height ?? 1
  }));

  const zones: Zone[] = (zonesAll || []).map((z: any) => ({
    storeId: currentStoreId,
    zoneId: z.ZoneId ?? z.zoneId ?? z.Id ?? z.id,
    zoneName: z.ZoneName ?? z.zoneName ?? z.Name ?? z.name ?? undefined,
    x: z.X ?? z.x ?? z.Position?.X ?? z.Position?.x ?? 0,
    y: z.Y ?? z.y ?? z.Position?.Y ?? z.Position?.y ?? 0,
    width: z.Width ?? z.width ?? 1,
    height: z.Height ?? z.height ?? 1
  }));

  if (!currentStore) return <Text>Store not found</Text>;

  const storeW = currentStore.gridDimensions?.width ?? 10;
  const storeH = currentStore.gridDimensions?.height ?? 10;

  // Use SVG viewBox in store units so the SVG scales to fill container keeping coordinates in meters
  const toPx = (v: number) => v; // coordinates used directly in viewBox units

  // stronger, more saturated colors for zones
  const zoneColors = ['#ff5252', '#00c853', '#2979ff', '#ffd600', '#7c4dff', '#00bfa5', '#ff8a50'];

  // prefer routePath (from backend) but fall back to prop 'path' if provided
  const drawnPath = (routePath && routePath.length > 0) ? routePath : (path ?? []);

  // map drawnPath to rendering coordinates: if points look like integer grid indices, render at cell centers
  const resNum = 1; // fixed grid resolution
  const mappedPath = drawnPath.map(p => {
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
  const startMapped = startIsIntX && startIsIntY
    ? { x: parsedStartX + 0.5 * resNum, y: parsedStartY + 0.5 * resNum }
    : { x: parsedStartX, y: parsedStartY };

  return (
    <View style={styles.fullContainer}>
      <View style={styles.selectorRow}>
        {/* Store dropdown with search */}
        <View style={{ width: 160 }}>
          <TextInput
            value={storeSearch || currentStoreId}
            onChangeText={t => { setStoreSearch(t); setShowStoreDropdown(true); }}
            onFocus={() => setShowStoreDropdown(true)}
            placeholder="Select store"
            style={[styles.routeInput, { width: 160 }]}
          />
          {showStoreDropdown && (
            <ScrollView style={{ maxHeight: 120, backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1 }}>
              {(knownStores.filter(s => s.toLowerCase().includes((storeSearch || '').toLowerCase()))).map(s => (
                <TouchableOpacity key={s} onPress={() => { setCurrentStoreId(s); setStoreSearch(''); setShowStoreDropdown(false); }} style={{ padding: 8 }}>
                  <Text>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* shelf display toggle removed per request */}

        {/* Route request inputs */}
        <View style={styles.routeControls}>
          {/* Product searchable dropdown */}
          <View style={{ width: 220 }}>
            <TextInput
              value={productSearch || (productsAll.find(p => p.productId === productId)?.name ?? productId)}
               onChangeText={t => { setProductSearch(t); setShowProductDropdown(true); }}
               onFocus={() => setShowProductDropdown(true)}
               placeholder="ProductId or name"
               style={[styles.routeInput, { width: 220 }]} 
             />
            {showProductDropdown && (
              <ScrollView style={{ maxHeight: 180, backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1 }}>
                {(productsAll.length > 0 ? productsAll : [{ productId: productId }]).filter(p => (p.productId ?? '').toLowerCase().includes((productSearch || '').toLowerCase()) || (p.name ?? '').toLowerCase().includes((productSearch || '').toLowerCase())).slice(0, 50).map(p => (
                  <TouchableOpacity key={p.productId} onPress={() => { setProductId(p.productId); setProductSearch(p.name ?? ''); setShowProductDropdown(false); }} style={{ padding: 8 }}>
                    <Text>{p.name ?? 'Produto desconhecido'}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TextInput value={startX} onChangeText={setStartX} placeholder="startX" style={[styles.routeInput, { width: 60, marginRight: 6 }]} keyboardType="numeric" />
            <TextInput value={startY} onChangeText={setStartY} placeholder="startY" style={[styles.routeInput, { width: 60 }]} keyboardType="numeric" />
          </View>
          <TouchableOpacity onPress={async () => {
            // perform POST to /api/routes/instructions
            setRouteLoading(true);
            try {
              const body = {
                StoreId: currentStoreId,
                ProductId: productId,
                StartPosition: { X: parseFloat(startX) || 0, Y: parseFloat(startY) || 0 },
                GridResolutionMeters: 1
              };
              console.log('Route request body:', body);
              const res = await fetch('http://localhost:5035/api/routes/instructions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
              if (!res.ok) throw new Error(`Route request failed: ${res.status}`);
              const json = await res.json();
              console.log('Route response:', json);
              const pathResponse = json.Path ?? json.path ?? [];
              setRoutePath(pathResponse);
            } catch (err: any) {
              console.error('Route request error', err);
              setRoutePath([]);
            } finally { setRouteLoading(false); }
          }} style={[styles.storeButton, styles.routeButton]}>
            <Text style={styles.storeButtonText}>{routeLoading ? 'Routing...' : 'Get Route'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setRoutePath([]); }} style={[styles.storeButton, styles.smallButton]}>
            <Text style={styles.storeButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* layout: map on the left, details panel on the right */}
      <View style={styles.mapRow}>
        <View style={{ flex: 1 }}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${storeW} ${storeH}`} preserveAspectRatio="xMidYMid meet">
            <Defs>
              <LinearGradient id="shelfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#a65d2a" stopOpacity={1} />
                <Stop offset="100%" stopColor="#5a2f0a" stopOpacity={1} />
              </LinearGradient>
              <LinearGradient id="shelfCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#c07a3b" stopOpacity={1} />
                <Stop offset="100%" stopColor="#8b4513" stopOpacity={1} />
              </LinearGradient>
            </Defs>

            {/* tiled square background for a clean e-commerce look */}
            <G>
              {(() => {
                const cols = Math.max(1, Math.floor(storeW));
                const rows = Math.max(1, Math.floor(storeH));
                const cells = [] as any[];
                for (let i = 0; i < cols; i++) {
                  for (let j = 0; j < rows; j++) {
                    const light = ((i + j) % 2) === 0;
                    cells.push(
                      // draw subtle checker with a faint 1m grid stroke to make cells visible
                      <Rect key={`cell-${i}-${j}`} x={i} y={j} width={1} height={1}
                        fill={light ? '#ffffff' : '#fbfbfd'}
                        stroke={'#e8edf5'}
                        strokeWidth={0.01}
                        opacity={0.95}
                      />
                    );
                  }
                }
                return cells;
              })()}
            </G>

            {/* zones with friendly names (clickable: opens details panel) */}
            <G>
              {zones.map((z, idx) => {
                const zoneName = z.zoneName ?? (z as any).name ?? z.zoneId ?? '';
                const zoneColor = zoneColors[idx % zoneColors.length];
                const labelWidth = Math.min(Math.max(2, z.width * 0.6), 8);
                const labelHeight = 0.9;
                const lx = z.x + z.width / 2 - labelWidth / 2;
                const ly = z.y + 0.12;
                const isSelected = selectedZone?.zoneId === z.zoneId;
                return (
                  <G key={z.zoneId ?? idx}>
                    <Rect
                      x={toPx(z.x)}
                      y={toPx(z.y)}
                      width={z.width}
                      height={z.height}
                      fill={zoneColor}
                      // make non-selected zones more translucent and slightly dim the selected state
                      opacity={isSelected ? 0.8 : 0.45}
                      stroke="#cfd8e3"
                      strokeWidth={0.02}
                      rx={0.3}
                      ry={0.3}
                      onPress={() => setSelectedZone(z)}
                    />
                    {/* label pill with same zone color and white text for contrast */}
                    <Rect x={lx} y={ly} width={labelWidth} height={labelHeight} rx={0.3} fill={zoneColor} opacity={0.96} />
                    <SvgText fontFamily="Inter, Roboto, Helvetica, Arial, sans-serif" x={z.x + (z.width / 2)} y={ly + labelHeight / 2} fontSize={0.62} fill="#fff" textAnchor="middle" alignmentBaseline="middle">{zoneName}</SvgText>
                  </G>
                );
              })}
            </G>

            {/* shelves: grey, semi-transparent, minimal style (always center-origin). Clamp to zone to avoid overlaps when scaled */}
            <G>
              {shelves.map(s => {
                const scale = shelfDisplayScale;
                // try to respect the zone so shelves don't visually overlap neighbors when scaled up
                const zone = zones.find(z => z.zoneId === s.zoneId);
                const padding = 0.08;
                let dispW = s.width * scale;
                let dispH = s.height * scale;
                if (zone) {
                  // keep shelf not larger than zone minus padding
                  dispW = Math.min(dispW, Math.max(0.1, zone.width - padding * 2));
                  dispH = Math.min(dispH, Math.max(0.1, zone.height - padding * 2));
                }
                const cx = s.x;
                const cy = s.y;
                // always treat X/Y as center
                const rInit = { x: cx - dispW / 2, y: cy - dispH / 2, w: dispW, h: dispH };
                const r = { ...rInit };
                if (zone) {
                  const minX = zone.x + padding;
                  const maxX = zone.x + zone.width - padding - r.w;
                  const minY = zone.y + padding;
                  const maxY = zone.y + zone.height - padding - r.h;
                  r.x = Math.max(minX, Math.min(r.x, maxX));
                  r.y = Math.max(minY, Math.min(r.y, maxY));
                }
                const rx = Math.min(0.6, Math.max(0.05, dispW * 0.08));
                return (
                  <G key={s.id}>
                    <Rect x={r.x + 0.04} y={r.y + 0.04} width={r.w} height={r.h} rx={rx} ry={rx} fill="#000" opacity={0.06} />
                    <Rect x={r.x} y={r.y} width={r.w} height={r.h} rx={rx} ry={rx} fill="#9e9e9e" opacity={0.6} stroke="#7a7a7a" strokeWidth={0.01} />
                  </G>
                );
              })}
            </G>

            {/* start person icon (drawn on top of map) */}
            <G>
              {/* head */}
              <Circle cx={startMapped.x} cy={startMapped.y - 0.25 * resNum} r={0.22 * resNum} fill="#222" stroke="#fff" strokeWidth={0.02} />
              {/* body */}
              <Rect x={startMapped.x - 0.22 * resNum} y={startMapped.y - 0.05 * resNum} width={0.44 * resNum} height={0.56 * resNum} rx={0.06 * resNum} fill="#222" stroke="#fff" strokeWidth={0.02} />
            </G>

            {mappedPath && mappedPath.length > 0 && (
              <G>
                <Polyline
                  points={mappedPath.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#007bff"
                  strokeWidth={0.1}
                />
                {mappedPath.map((p, i) => {
                  const next = mappedPath[i + 1];
                  if (!next) return null; // no arrow for last point
                  const dx = next.x - p.x;
                  const dy = next.y - p.y;
                  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                  const size = 0.45 * resNum; // arrow size (in store units) — scaled by resolution
                  // use a slightly narrower base for a nicer arrow shape
                  const half = size * 0.6;
                  // triangle points pointing to the right, will be rotated by 'angle' and translated to a point slightly
                  // ahead along the segment so the arrow appears 'inside' the line rather than on the node
                  const pts = `0,0 ${-size},${-half} ${-size},${half}`;
                  const posFactor = 0.6; // fraction along segment from current point towards next
                  const tx = p.x + dx * posFactor;
                  const ty = p.y + dy * posFactor;
                  return (
                    <Polygon
                      key={`p-${i}`}
                      points={pts}
                      fill="#007bff"
                      transform={`translate(${tx},${ty}) rotate(${angle})`}
                    />
                  );
                })}
              </G>
            )}
          </Svg>
        </View>
        <View style={styles.sidePanel}>
          {!selectedZone ? (
            <Text style={{ margin: 8 }}>Clique numa zona para ver detalhes</Text>
          ) : (
            <View style={styles.zoneCard}>
              <View style={styles.zoneCardHeader}>
                <Text style={styles.zoneCardTitle}>{selectedZone.zoneName ?? (selectedZone as any).name ?? selectedZone.zoneId}</Text>
                <TouchableOpacity onPress={() => setSelectedZone(null)} style={styles.zoneCardClose}>
                  <Text style={styles.zoneCardCloseText}>Fechar</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.zoneCardBody}>
                <Text style={{ marginBottom: 4, color: '#666' }}>{selectedZone.zoneId}</Text>
                <Text style={{ marginBottom: 6 }}>Dimensões: {selectedZone.width}m × {selectedZone.height}m</Text>
                {/* shelves in zone */}
                <Text style={{ fontWeight: '600', marginTop: 8 }}>Prateleiras</Text>
                {(() => {
                  const zoneShelves = shelves.filter(sh => sh.zoneId === selectedZone.zoneId);
                  if (zoneShelves.length === 0) return <Text>Nenhuma prateleira nesta zona</Text>;
                  return zoneShelves.map(sh => (
                    <View key={sh.id} style={{ paddingVertical: 6 }}>
                      <Text style={{ fontWeight: '500' }}>{sh.id}</Text>
                      <Text style={{ color: '#444' }}>Pos: {sh.x.toFixed(2)}, {sh.y.toFixed(2)} • {sh.width}m × {sh.height}m</Text>
                    </View>
                  ));
                })()}

                {/* products for the zone (loaded on demand) */}
                <Text style={{ fontWeight: '600', marginTop: 8 }}>Produtos</Text>
                {!productZones ? (
                  <TouchableOpacity onPress={async () => {
                    try {
                      const url = `${baseApi}/product-zones?storeId=${encodeURIComponent(currentStoreId)}`;
                      const res = await fetch(url);
                      if (!res.ok) throw new Error('Não disponível');
                      const data = await res.json();
                      setProductZones(data);
                    } catch (e) {
                      console.warn('Failed to load product-zones', e);
                      setProductZones([]);
                    }
                  }} style={{ padding: 8, backgroundColor: '#eee', borderRadius: 6, marginTop: 6 }}>
                    <Text>Carregar mapeamento de produtos (se suportado pelo backend)</Text>
                  </TouchableOpacity>
                ) : (
                  (() => {
                    const shelfIds = new Set(shelves.filter(sh => sh.zoneId === selectedZone.zoneId).map(s => s.id));
                    const productsInZone = (productZones || []).filter(pz => shelfIds.has(pz.shelfId));
                    if (productsInZone.length === 0) return <Text>Nenhum produto encontrado nesta zona</Text>;
                    return productsInZone.map(pz => (
                      <TouchableOpacity key={pz.productId} onPress={() => {
                        setProductId(pz.productId);
                        setProductSearch(pz.productName ?? (productsAll.find(pp => pp.productId === pz.productId)?.name ?? ''));
                        setShowProductDropdown(false);
                      }} style={{ paddingVertical: 6 }}>
                        <Text>{pz.productName ?? (productsAll.find(pp => pp.productId === pz.productId)?.name) ?? 'Produto desconhecido'}</Text>
                      </TouchableOpacity>
                    ));
                  })()
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text>Store: {currentStoreId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, width: '100%', alignItems: 'stretch', paddingHorizontal: 12, backgroundColor: '#fff' },
  selectorRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, gap: 8, flexWrap: 'wrap' as any },
  storeButton: { paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 6, borderRadius: 8, backgroundColor: '#fff', borderColor: '#e6e6e6', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  storeButtonActive: { backgroundColor: '#007bff' },
  storeButtonText: { color: '#333', fontWeight: '600' },
  storeButtonTextActive: { color: '#fff' },
  mapContainer: { flex: 1, alignSelf: 'stretch', marginHorizontal: 6, minHeight: 480, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' },
  infoRow: { padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
   dimText: { fontWeight: '600' },
   smallButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
   routeControls: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  routeInput: { backgroundColor: '#fff', borderColor: '#e9e9e9', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6, marginHorizontal: 6, borderRadius: 6, minWidth: 80 },
  routeButton: { marginLeft: 6 },
  directionsPanel: { padding: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  directionItem: { paddingVertical: 4 },
  mapRow: { flexDirection: 'row', flex: 1, alignItems: 'stretch', gap: 12 },
  sidePanel: { width: 300, padding: 12, borderLeftWidth: 1, borderLeftColor: '#f3f3f3', backgroundColor: '#fafafa' },
  // zone detail card styles
  zoneCard: { backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
  zoneCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f3f3', backgroundColor: '#fafcff' },
  zoneCardTitle: { fontWeight: '700', fontSize: 16 },
  zoneCardClose: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fff', borderColor: '#e9e9e9', borderWidth: 1 },
  zoneCardCloseText: { color: '#333', fontWeight: '600' },
  zoneCardBody: { maxHeight: 520, padding: 12, backgroundColor: '#fff' },
});
