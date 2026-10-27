"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Stop } from "@/core/mocks/tulcanIbarraData";

// Helper para recentrar el mapa cuando cambia la selección
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 10, { duration: 1.2 });
  }, [center, map]);
  return null;
}

interface LeafletMapInnerProps {
  stops: Stop[];
  originOrder: number;
  destinationOrder: number;
  selectedStop: Stop;
  onSelectStop: (stop: Stop) => void;
}

export default function LeafletMapInner({
  stops,
  originOrder,
  destinationOrder,
  selectedStop,
  onSelectStop,
}: LeafletMapInnerProps) {
  // Centro geográfico aproximado del corredor Carchi - Imbabura
  const defaultCenter: [number, number] = [0.58, -77.92];

  // Puntos de la polilínea a lo largo de la Panamericana E35
  const polylineCoords: [number, number][] = useMemo(() => {
    return stops.map((s) => [s.coordinates.lat, s.coordinates.lng]);
  }, [stops]);

  // Generador de Iconos SVG estilizados para cada parada
  const createStopIcon = (stop: Stop) => {
    const isOrigin = stop.stopOrder === originOrder;
    const isDestination = stop.stopOrder === destinationOrder;
    const isSelected = stop.stopOrder === selectedStop.stopOrder;

    let bgClass = "bg-slate-800 border-white/60 text-slate-200";
    let ringClass = "";

    if (isOrigin) {
      bgClass = "bg-emerald-500 border-white text-slate-950 font-black";
      ringClass = "ring-4 ring-emerald-500/40 animate-pulse";
    } else if (isDestination) {
      bgClass = "bg-cyan-500 border-white text-slate-950 font-black";
      ringClass = "ring-4 ring-cyan-500/40 animate-pulse";
    } else if (isSelected) {
      bgClass = "bg-amber-500 border-white text-slate-950 font-black";
      ringClass = "ring-4 ring-amber-500/40";
    }

    const html = `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs shadow-lg transition-transform hover:scale-125 ${bgClass} ${ringClass}">
          ${stop.stopOrder}
        </div>
        <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-white border border-white/20 shadow-md">
          ${stop.name}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-leaflet-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapRecenter center={[selectedStop.coordinates.lat, selectedStop.coordinates.lng]} />

        {/* Capa de OpenStreetMap estándar */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Línea que representa el corredor Panamericana E35 */}
        <Polyline
          positions={polylineCoords}
          pathOptions={{
            color: "#10b981",
            weight: 5,
            opacity: 0.85,
            dashArray: "1, 8",
          }}
        />

        {/* Marcadores de las 8 paradas */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.coordinates.lat, stop.coordinates.lng]}
            icon={createStopIcon(stop)}
            eventHandlers={{
              click: () => onSelectStop(stop),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 text-slate-900">
                <p className="font-bold text-sm">{stop.name}</p>
                <p className="text-xs text-slate-600">
                  {stop.canton} - {stop.province}
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  Km {stop.kmFromOrigin} | {stop.elevationMeters} msnm
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
