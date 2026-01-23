import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import Floorplan from "@/assets/images/floorplan.svg";

type Pos = { x: number; y: number };

export default function IndoorMap() {
  // Original SVG viewBox size
  const width = 1600;
  const height = 900;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [path, setPath] = useState<Pos[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive inputs for testing
  const [storeId, setStoreId] = useState("LISBOA01");
  const [productId, setProductId] = useState("SKU001234");
  const [startX, setStartX] = useState("0");
  const [startY, setStartY] = useState("0");

  const requestBody = {
    storeId,
    productId,
    startPosition: { x: parseFloat(startX) || 0, y: parseFloat(startY) || 0 },
    gridResolutionMeters: 1,
  };

  // Example batch test cases you can modify
  const exampleTests = [
    { storeId: "LISBOA01", productId: "SKU001234", start: { x: 0, y: 0 } },
    { storeId: "LISBOA01", productId: "SKU001234", start: { x: 5, y: 3 } },
    { storeId: "PORTO01", productId: "SKU001234", start: { x: 2, y: 1 } },
  ];

  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [storeGrid, setStoreGrid] = useState<{
    width: number;
    height: number;
    gridResolutionMeters: number;
  } | null>(null);
  const [flipY, setFlipY] = useState(false);

  // keep existing behavior removed: now calls happen on demand via UI

  async function fetchRoute(body: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5035/api/routes/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const rawPath = json.Path ?? json.path ?? [];

      // If backend returned StoreGrid include it in state for mapping
      const sg = json.StoreGrid ?? json.storeGrid ?? null;
      if (sg) {
        setStoreGrid({
          width: sg.Width ?? sg.width ?? 0,
          height: sg.Height ?? sg.height ?? 0,
          gridResolutionMeters:
            sg.GridResolutionMeters ?? sg.gridResolutionMeters ?? 1,
        });
      }
      const normalized: Pos[] = rawPath.map((p: any) => ({
        x: p.x ?? p.X ?? 0,
        y: p.y ?? p.Y ?? 0,
      }));
      setPath(normalized);
      return { ok: true, json };
    } catch (err: any) {
      setError(err.message ?? String(err));
      return { ok: false, error: err };
    } finally {
      setLoading(false);
    }
  }

  async function runBatch() {
    setBatchResults([]);
    const results: string[] = [];
    for (const t of exampleTests) {
      const body = {
        storeId: t.storeId,
        productId: t.productId,
        startPosition: t.start,
        gridResolutionMeters: 1,
      };
      const r = await fetchRoute(body);
      if (r.ok) results.push(`${t.storeId}/${t.productId} => OK`);
      else results.push(`${t.storeId}/${t.productId} => ERROR`);
    }
    setBatchResults(results);
  }

  async function fetchStoreMetadata(storeIdToFetch: string) {
    try {
      const res = await fetch(
        `http://localhost:5035/api/stores/${encodeURIComponent(storeIdToFetch)}`,
      );
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const gd = json.gridDimensions ?? json.GridDimensions ?? {};
      const width = gd.width ?? gd.Width ?? 0;
      const height = gd.height ?? gd.Height ?? 0;
      setStoreGrid({
        width: width || 0,
        height: height || 0,
        gridResolutionMeters: 1,
      });
      return { ok: true, json };
    } catch (err: any) {
      setError(err.message ?? String(err));
      return { ok: false, error: err };
    }
  }

  return (
    <View
      style={[styles.container, { width: screenWidth, height: screenHeight }]}
    >
      <ScrollView
        style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: 8,
            borderRadius: 6,
          }}
        >
          <Text>Store</Text>
          <TextInput
            value={storeId}
            onChangeText={setStoreId}
            style={{ borderWidth: 1, padding: 4 }}
          />
          <Text>Product</Text>
          <TextInput
            value={productId}
            onChangeText={setProductId}
            style={{ borderWidth: 1, padding: 4 }}
          />
          <Text>Start X</Text>
          <TextInput
            value={startX}
            onChangeText={setStartX}
            keyboardType="numeric"
            style={{ borderWidth: 1, padding: 4 }}
          />
          <Text>Start Y</Text>
          <TextInput
            value={startY}
            onChangeText={setStartY}
            keyboardType="numeric"
            style={{ borderWidth: 1, padding: 4 }}
          />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Button
              title="Get Route"
              onPress={async () => {
                await fetchStoreMetadata(storeId);
                await fetchRoute(requestBody);
              }}
            />
            <View style={{ width: 8 }} />
            <Button title="Run Batch" onPress={runBatch} />
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Button
              title={flipY ? "FlipY: ON" : "FlipY: OFF"}
              onPress={() => setFlipY((s) => !s)}
            />
            <View style={{ width: 8 }} />
            <Button
              title="Refresh Store"
              onPress={() => fetchStoreMetadata(storeId)}
            />
          </View>
          {storeGrid && (
            <Text style={{ marginTop: 6 }}>
              Store grid: {storeGrid.width}m × {storeGrid.height}m
            </Text>
          )}
          {batchResults.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {batchResults.map((r, i) => (
                <Text key={i}>{r}</Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Background floorplan layer */}
      <Floorplan
        width={screenWidth}
        height={screenHeight}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Overlay layer: paths + markers */}
      <Svg
        width={screenWidth}
        height={screenHeight}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={StyleSheet.absoluteFill}
      >
        {loading && <></>}
        {error && <></>}
        {path &&
          path.length > 0 &&
          (() => {
            // Map real-world coordinates (meters) to SVG viewBox using store grid metadata
            // If storeGrid is available, use it; otherwise fallback to auto-fit behavior
            let svgPoints: { x: number; y: number }[] = [];
            if (storeGrid && storeGrid.width > 0 && storeGrid.height > 0) {
              const sx = (p: Pos) => (p.x / storeGrid.width) * width;
              const sy = (p: Pos) => (p.y / storeGrid.height) * height;
              svgPoints = path.map((p) => ({
                x: sx(p),
                y: flipY ? height - sy(p) : sy(p),
              }));
            } else {
              // Fit path into SVG viewBox while preserving aspect
              const padding = 20;
              const xs = path.map((p) => p.x);
              const ys = path.map((p) => p.y);
              const minX = Math.min(...xs, 0);
              const minY = Math.min(...ys, 0);
              const maxX = Math.max(...xs, 0);
              const maxY = Math.max(...ys, 0);
              const dataW = Math.max(1, maxX - minX + padding * 2);
              const dataH = Math.max(1, maxY - minY + padding * 2);
              const scale = Math.min(width / dataW, height / dataH);
              const offsetX =
                (width - dataW * scale) / 2 - (minX - padding) * scale;
              const offsetY =
                (height - dataH * scale) / 2 - (minY - padding) * scale;

              const toSvg = (p: Pos) => ({
                x: p.x * scale + offsetX,
                y: p.y * scale + offsetY,
              });
              svgPoints = path.map(toSvg);
            }

            return (
              <>
                <Polyline
                  points={svgPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                  stroke="blue"
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Circle
                  cx={svgPoints[0].x}
                  cy={svgPoints[0].y}
                  r={20}
                  fill="green"
                  //Start Point
                />
                <Circle
                  cx={svgPoints[svgPoints.length - 1].x}
                  cy={svgPoints[svgPoints.length - 1].y}
                  r={20}
                  fill="red"
                  //Destination
                />
              </>
            );
          })()}
      </Svg>
      {loading && (
        <View style={{ position: "absolute", top: 10, left: 10 }}>
          <Text>Loading route...</Text>
        </View>
      )}
      {error && (
        <View style={{ position: "absolute", top: 10, left: 10 }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "#fff",
  },
});
