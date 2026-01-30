import React from "react";
import { View } from "react-native";
import Svg, { Rect, G, Polyline, Polygon, Defs, LinearGradient, Stop, Text as SvgText, Circle } from "react-native-svg";

// Types kept local to avoid cross-file deps
export type Shelf = {
  id: string;
  storeId: string;
  zoneId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type Zone = {
  storeId: string;
  zoneId: string;
  zoneName?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category?: string;
};

interface MapCanvasProps {
  storeW: number;
  storeH: number;
  containerWidth: number;
  containerHeight: number;
  zones: Zone[];
  shelves: Shelf[];
  shelfDisplayScale: number;
  selectedZone: Zone | null;
  setSelectedZone: (z: Zone) => void;
  mappedPath: { x: number; y: number }[];
  resNum: number;
  startMapped: { x: number; y: number };
  showDebugOverlay: boolean;
  clientGrid: boolean[][];
  gridCols: number;
  gridRows: number;
  startIdxX: number;
  startIdxY: number;
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  storeW,
  storeH,
  containerWidth,
  containerHeight,
  zones,
  shelves,
  shelfDisplayScale,
  selectedZone,
  setSelectedZone,
  mappedPath,
  resNum,
  startMapped,
  showDebugOverlay,
  clientGrid,
  gridCols,
  gridRows,
  startIdxX,
  startIdxY,
}) => {
  const zoneColors = [
    "#ff5252",
    "#00c853",
    "#2979ff",
    "#ffd600",
    "#7c4dff",
    "#00bfa5",
    "#ff8a50",
  ];

  const toPx = (v: number) => v;

  return (
    <View style={{ width: containerWidth, height: containerHeight }}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${storeW} ${storeH}`}
        preserveAspectRatio="xMidYMid meet"
      >
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

        {/* tiled square background */}
        <G>
          {(() => {
            const cols = Math.max(1, Math.ceil(storeW));
            const rows = Math.max(1, Math.ceil(storeH));
            const cells: any[] = [];
            for (let i = 0; i < cols; i++) {
              for (let j = 0; j < rows; j++) {
                const light = (i + j) % 2 === 0;
                cells.push(
                  <Rect
                    key={`cell-${i}-${j}`}
                    x={i}
                    y={j}
                    width={1}
                    height={1}
                    fill={light ? "#ffffff" : "#fbfbfd"}
                    stroke={"#e8edf5"}
                    strokeWidth={0.01}
                    opacity={0.95}
                  />,
                );
              }
            }
            return cells;
          })()}
        </G>

        {/* Debug overlay */}
        {showDebugOverlay && (
          <G>
            {(() => {
              const rects: any[] = [];
              for (let gx = 0; gx < gridCols; gx++) {
                for (let gy = 0; gy < gridRows; gy++) {
                  const walkable = clientGrid[gx][gy];
                  if (!walkable) {
                    rects.push(
                      <Rect
                        key={`dbg-${gx}-${gy}`}
                        x={gx}
                        y={gy}
                        width={1}
                        height={1}
                        fill="#ff5252"
                        opacity={0.22}
                      />,
                    );
                  }
                }
              }
              rects.push(
                <Rect
                  key={`dbg-start`}
                  x={startIdxX}
                  y={startIdxY}
                  width={1}
                  height={1}
                  fill={"none"}
                  stroke={"#000"}
                  strokeWidth={0.04}
                />,
              );
              return rects;
            })()}
          </G>
        )}

        {/* zones */}
        <G>
          {zones.map((z, idx) => {
            const zoneName = z.zoneName ?? (z as any).name ?? z.zoneId ?? "";
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
                  opacity={isSelected ? 0.8 : 0.45}
                  stroke="#cfd8e3"
                  strokeWidth={0.02}
                  rx={0.3}
                  ry={0.3}
                  onPress={() => setSelectedZone(z)}
                />
                <Rect x={lx} y={ly} width={labelWidth} height={labelHeight} rx={0.3} fill={zoneColor} opacity={0.96} />
                <SvgText
                  fontFamily="Inter, Roboto, Helvetica, Arial, sans-serif"
                  x={z.x + z.width / 2}
                  y={ly + labelHeight / 2}
                  fontSize={0.62}
                  fill="#fff"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {zoneName}
                </SvgText>
              </G>
            );
          })}
        </G>

        {/* shelves */}
        <G>
          {shelves.map((s) => {
            const scale = shelfDisplayScale;
            const zone = zones.find((z) => z.zoneId === s.zoneId);
            const padding = 0.08;
            let dispW = s.width * scale;
            let dispH = s.height * scale;
            if (zone) {
              dispW = Math.min(dispW, Math.max(0.1, zone.width - padding * 2));
              dispH = Math.min(dispH, Math.max(0.1, zone.height - padding * 2));
            }
            const cx = s.x;
            const cy = s.y;
            const rInit = { x: cx - dispW / 2, y: cy - dispH / 2, w: dispW, h: dispH };
            const r = { ...rInit } as any;
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

        {/* start marker */}
        <G>
          <Circle cx={startMapped.x} cy={startMapped.y - 0.25 * resNum} r={0.22 * resNum} fill="#222" stroke="#fff" strokeWidth={0.02} />
          <Rect x={startMapped.x - 0.22 * resNum} y={startMapped.y - 0.05 * resNum} width={0.44 * resNum} height={0.56 * resNum} rx={0.06 * resNum} fill="#222" stroke="#fff" strokeWidth={0.02} />
        </G>

        {/* path + arrows + destination */}
        {mappedPath && mappedPath.length > 0 && (
          <G>
            <Polyline points={mappedPath.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#007bff" strokeWidth={0.1} />
            {mappedPath.map((p, i) => {
              const next = mappedPath[i + 1];
              if (!next) return null;
              const dx = next.x - p.x;
              const dy = next.y - p.y;
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
              const size = 0.45 * resNum;
              const half = size * 0.6;
              const pts = `0,0 ${-size},${-half} ${-size},${half}`;
              const posFactor = 0.6;
              const tx = p.x + dx * posFactor;
              const ty = p.y + dy * posFactor;
              return (
                <Polygon key={`p-${i}`} points={pts} fill="#007bff" transform={`translate(${tx},${ty}) rotate(${angle})`} />
              );
            })}
            {(() => {
              const dest = mappedPath[mappedPath.length - 1];
              if (!dest) return null;
              const pinWidth = 0.6 * resNum;
              const pinHeight = 1.0 * resNum;
              const pinPts = `${dest.x},${dest.y + pinHeight} ${dest.x - pinWidth / 2},${dest.y} ${dest.x + pinWidth / 2},${dest.y}`;
              return (
                <G key="destination-marker">
                  <Polygon points={pinPts} fill="#d32f2f" opacity={1} />
                  <Circle cx={dest.x} cy={dest.y - 0.15 * resNum} r={0.32 * resNum} fill="#fff" stroke="#d32f2f" strokeWidth={0.05} />
                </G>
              );
            })()}
          </G>
        )}
      </Svg>
    </View>
  );
};

export default MapCanvas;
