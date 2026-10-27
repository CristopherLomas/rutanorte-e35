"use client";

import React, { useState } from "react";
import { Stop } from "@/core/mocks/tulcanIbarraData";
import { InteractiveRouteMap } from "./InteractiveRouteMap";
import { Map, X, Maximize2, Minimize2, Navigation } from "lucide-react";

interface FloatingMapDrawerProps {
  stops: Stop[];
  originStop: Stop;
  destinationStop: Stop;
  activeStop: Stop;
  distanceKm: number;
  formattedDuration: string;
  isSeniorDiscountApplied?: boolean;
}

export const FloatingMapDrawer: React.FC<FloatingMapDrawerProps> = ({
  stops,
  originStop,
  destinationStop,
  activeStop,
  distanceKm,
  formattedDuration,
  isSeniorDiscountApplied,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <>
      {/* Botón Flotante Moderno en la esquina inferior derecha */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer"
          title="Ver mapa vial de la ruta"
        >
          <Map className="w-4 h-4 text-blue-400" />
          <span>{isOpen ? "Ocultar mapa" : "Ver mapa vial de la ruta"}</span>
          {distanceKm > 0 && !isOpen && (
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
              {distanceKm} km
            </span>
          )}
        </button>
      </div>

      {/* Modal / Panel Elegante del Mapa */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300 ${
            isExpanded
              ? "inset-4 md:inset-8"
              : "bottom-18 right-5 w-[92vw] sm:w-[520px] md:w-[600px] h-[440px] md:h-[480px]"
          }`}
        >
          {/* Header del Modal */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Corredor Panamericano E35
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {distanceKm > 0
                    ? `${originStop.name} ➔ ${destinationStop.name} (${distanceKm} km • ~${formattedDuration})`
                    : "8 Paradas Interparroquiales Tulcán - Ibarra"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title={isExpanded ? "Reducir tamaño" : "Pantalla completa"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Cerrar mapa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenedor del Mapa Leaflet */}
          <div className="relative w-full h-[calc(100%-53px)]">
            <InteractiveRouteMap
              stops={stops}
              originStop={originStop}
              destinationStop={destinationStop}
              activeStop={activeStop}
              distanceKm={distanceKm}
              formattedDuration={formattedDuration}
              isSeniorDiscountApplied={isSeniorDiscountApplied}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMapDrawer;
