"use client";
import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { MapDevice, DeviceState } from "@/resources/models/PhoneNotify/types";
import { formatDate, isOnline } from "@/app/components/phonenotify/apiHelpers";
import "leaflet/dist/leaflet.css";

/** Fix Leaflet default icon paths broken by webpack (404 on /marker-icon.png). */
function ensureDefaultIcons() {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

function makeDivIcon(color: string, size = 14, ring = false) {
  const border = ring ? "3px solid #fff" : "2px solid #fff";
  const box = size;
  return L.divIcon({
    className: "pn-map-marker",
    html: `<span style="
      display:block;width:${box}px;height:${box}px;border-radius:50%;
      background:${color};border:${border};box-shadow:0 1px 4px rgba(0,0,0,.45);
    "></span>`,
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    popupAnchor: [0, -box / 2],
  });
}

const iconOnline = () => makeDivIcon("#22c55e", 16);
const iconOffline = () => makeDivIcon("#94a3b8", 16);
const iconHistory = () => makeDivIcon("#3b82f6", 10);
const iconNewest = () => makeDivIcon("#ef4444", 18, true);

function validLatLng(lat: unknown, lng: unknown): lat is number {
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    // Leaflet often needs invalidateSize after layout settles
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    if (points.length === 0) return () => window.clearTimeout(t);
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 16 });
    }
    return () => window.clearTimeout(t);
  }, [map, key]);
  return null;
}

function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    const t1 = window.setTimeout(onResize, 100);
    const t2 = window.setTimeout(onResize, 500);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [map]);
  return null;
}

export type DevicesMapProps = {
  devices?: MapDevice[];
  /** Location history points — drawn as markers + ordered polyline (oldest → newest) */
  history?: DeviceState[];
  height?: string;
  /** When true, emphasize track (device detail page) */
  showTrack?: boolean;
};

export default function DevicesMap({
  devices = [],
  history = [],
  height = "520px",
  showTrack = false,
}: DevicesMapProps) {
  useEffect(() => {
    ensureDefaultIcons();
  }, []);

  const sortedHistory = useMemo(() => {
    return [...history]
      .filter((s) => validLatLng(s.latitude, s.longitude))
      .sort((a, b) => {
        const ta = a.reported_at ? new Date(a.reported_at).getTime() : 0;
        const tb = b.reported_at ? new Date(b.reported_at).getTime() : 0;
        return ta - tb; // oldest → newest for polyline direction
      });
  }, [history]);

  const trackPoints: [number, number][] = useMemo(
    () =>
      sortedHistory.map(
        (s) => [Number(s.latitude), Number(s.longitude)] as [number, number]
      ),
    [sortedHistory]
  );

  const devicePoints: [number, number][] = useMemo(
    () =>
      devices
        .filter((d) => validLatLng(d.latitude, d.longitude))
        .map((d) => [Number(d.latitude), Number(d.longitude)] as [number, number]),
    [devices]
  );

  const allPoints = useMemo(
    () => [...devicePoints, ...trackPoints],
    [devicePoints, trackPoints]
  );

  const center: [number, number] = allPoints[0] || [35.6892, 51.389];
  const newestIdx = sortedHistory.length - 1;

  if (typeof window === "undefined") {
    return (
      <div style={{ height, width: "100%" }} className="flex items-center justify-center bg-lightgray">
        Loading map…
      </div>
    );
  }

  return (
    <div
      style={{ height, width: "100%", minHeight: 280 }}
      className="rounded-lg overflow-hidden relative z-0 border border-ld"
    >
      <MapContainer
        center={center}
        zoom={allPoints.length ? 12 : 6}
        style={{ height: "100%", width: "100%", minHeight: 280 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InvalidateOnResize />
        <FitBounds points={allPoints} />

        {showTrack && trackPoints.length >= 2 && (
          <Polyline
            positions={trackPoints}
            pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.85 }}
          />
        )}
        {!showTrack && trackPoints.length >= 2 && (
          <Polyline
            positions={trackPoints}
            pathOptions={{ color: "#6366f1", weight: 3, opacity: 0.7 }}
          />
        )}

        {devices.map((d) => {
          if (!validLatLng(d.latitude, d.longitude)) return null;
          const online = isOnline(d.last_seen_at, d.is_online);
          return (
            <Marker
              key={`d-${d.id}`}
              position={[Number(d.latitude), Number(d.longitude)]}
              icon={online ? iconOnline() : iconOffline()}
            >
              <Popup>
                <div className="text-sm">
                  <strong>
                    {d.label || `${d.brand || ""} ${d.model || ""}`.trim() || `#${d.id}`}
                  </strong>
                  <br />
                  {online ? "Online" : "Offline"}
                  <br />
                  {Number(d.latitude).toFixed(5)}, {Number(d.longitude).toFixed(5)}
                  <br />
                  {formatDate(d.last_seen_at)}
                  <br />
                  <Link href={`/Devices/${d.id}`}>Open details</Link>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {sortedHistory.map((s, i) => {
          const isNewest = i === newestIdx;
          return (
            <Marker
              key={`h-${s.id ?? i}-${s.reported_at}`}
              position={[Number(s.latitude), Number(s.longitude)]}
              icon={isNewest ? iconNewest() : iconHistory()}
              zIndexOffset={isNewest ? 1000 : i}
            >
              <Popup>
                <div className="text-sm">
                  {isNewest ? <strong>Latest · </strong> : null}
                  {formatDate(s.reported_at)}
                  <br />
                  {Number(s.latitude).toFixed(5)}, {Number(s.longitude).toFixed(5)}
                  <br />
                  Battery: {s.battery_level ?? "—"}%
                  {s.is_charging ? " ⚡" : ""}
                  <br />
                  Network: {s.network_type || "—"}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
