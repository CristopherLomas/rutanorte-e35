"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Stop } from "@/core/mocks/tulcanIbarraData";
import { Compass } from "lucide-react";

interface InteractiveRouteMapProps {
  stops: Stop[];
  originStop: Stop;
  destinationStop: Stop;
  activeStop: Stop;
  onSelectStop?: (stop: Stop) => void;
  distanceKm: number;
  formattedDuration: string;
  isSeniorDiscountApplied?: boolean;
}

// Carga dinámica de Leaflet con SSR deshabilitado para evitar errores de renderizado en servidor
const LeafletRouteMapInner = dynamic(
  () => import("./LeafletRouteMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/10 text-slate-300">
        <Compass className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide">
          Cargando Cartografía Panamericana E35...
        </p>
        <span className="text-[11px] text-slate-500 mt-1">
          OpenStreetMap & Geometría OSRM en tiempo real
        </span>
      </div>
    ),
  }
);

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = (props) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden glass-panel border border-white/15 shadow-2xl">
      <LeafletRouteMapInner {...props} />
    </div>
  );
};

export default InteractiveRouteMap;
