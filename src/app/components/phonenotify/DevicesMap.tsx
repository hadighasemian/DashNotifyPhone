"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { MapDevice, DeviceState } from "@/resources/models/PhoneNotify/types";
import { formatDate, isOnline } from "@/app/components/phonenotify/apiHelpers";
import "leaflet/dist/leaflet.css";

const iconOnline = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const iconOffline = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const iconHistory = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, points]);
  return null;
}

type Props = {
  devices?: MapDevice[];
  history?: DeviceState[];
  height?: string;
};

export default function DevicesMap({ devices = [], history = [], height = "520px" }: Props) {
  const devicePoints = devices
    .filter((d) => d.latitude != null && d.longitude != null)
    .map((d) => [Number(d.latitude), Number(d.longitude)] as [number, number]);

  const historyPoints = history
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => [Number(s.latitude), Number(s.longitude)] as [number, number]);

  const all = [...devicePoints, ...historyPoints];
  const center: [number, number] = all[0] || [35.6892, 51.389];

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden z-0">
      <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={all} />
        {devices.map((d) => {
          if (d.latitude == null || d.longitude == null) return null;
          const online = isOnline(d.last_seen_at, d.is_online);
          return (
            <Marker
              key={`d-${d.id}`}
              position={[Number(d.latitude), Number(d.longitude)]}
              icon={online ? iconOnline : iconOffline}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{d.label || `${d.brand} ${d.model}` || `#${d.id}`}</strong>
                  <br />
                  {online ? "Online" : "Offline"}
                  <br />
                  {formatDate(d.last_seen_at)}
                  <br />
                  <Link href={`/Devices/${d.id}`}>Open details</Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {history.map((s, i) => {
          if (s.latitude == null || s.longitude == null) return null;
          return (
            <Marker
              key={`h-${s.id || i}`}
              position={[Number(s.latitude), Number(s.longitude)]}
              icon={iconHistory}
            >
              <Popup>
                <div className="text-sm">
                  {formatDate(s.reported_at)}
                  <br />
                  Battery: {s.battery_level ?? "—"}%
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
