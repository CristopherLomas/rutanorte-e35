"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { TULCAN_IBARRA_STOPS, Stop } from "@/core/mocks/tulcanIbarraData";
import { MapPin, Navigation, Mountain, Sun, Compass } from "lucide-react";

// Importación dinámica para evitar errores SSR con Leaflet
const LeafletMapInner = dynamic(
  () => import("./LeafletMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 text-slate-400">
        <Compass className="w-10 h-10 text-emerald-400 animate-spin mb-2" />
        <p className="text-sm">Cargando Mapa Cartográfico Panamericano E35...</p>
      </div>
    ),
  }
);

interface RoutesMapPanelProps {
  originOrder: number;
  destinationOrder: number;
  onSelectStop?: (stop: Stop) => void;
}

export const RoutesMapPanel: React.FC<RoutesMapPanelProps> = ({
  originOrder,
  destinationOrder,
  onSelectStop,
}) => {
  const [selectedStop, setSelectedStop] = useState<Stop>(TULCAN_IBARRA_STOPS[0]);

  const handleStopClick = (stop: Stop) => {
    setSelectedStop(stop);
    if (onSelectStop) onSelectStop(stop);
  };

  return (
    <div className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden glass-panel border border-white/15 shadow-2xl">
      {/* Header del Mapa */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Corredor Panamericano E35
            </h3>
            <p className="text-[11px] text-slate-400">
              8 Paradas Interparroquiales Tulcán ↔ Ibarra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-[11px] text-slate-400">Enlace Satelital Activo</span>
        </div>
      </div>

      {/* Contenedor del Mapa Leaflet Interactivo */}
      <div className="relative flex-1 w-full min-h-[300px] overflow-hidden">
        <LeafletMapInner
          stops={TULCAN_IBARRA_STOPS}
          originOrder={originOrder}
          destinationOrder={destinationOrder}
          selectedStop={selectedStop}
          onSelectStop={handleStopClick}
        />

        {/* Tarjeta flotante con detalles de la parroquia activa */}
        <div className="absolute bottom-3 left-3 right-3 md:right-auto md:max-w-sm p-3.5 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-white/20 text-white shadow-2xl z-[1000] pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Parada #{selectedStop.stopOrder}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedStop.canton}, {selectedStop.province}
                </span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                {selectedStop.name}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-semibold font-mono">
                Km {selectedStop.kmFromOrigin}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {selectedStop.description}
          </p>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedStop.elevationMeters} msnm</span>
            </div>
            <div className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{selectedStop.climate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutesMapPanel;
