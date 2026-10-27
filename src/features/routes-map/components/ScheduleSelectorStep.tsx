"use client";

import React, { useState } from "react";
import {
  BusTrip,
  Stop,
  MOCK_BUS_TRIPS,
  getTripSeatAvailability,
} from "@/core/mocks/tulcanIbarraData";
import { RouteCalculationResult } from "../types";
import { ChevronRight, Calendar, Sparkles, Check, Bus } from "lucide-react";

interface ScheduleSelectorStepProps {
  originStop: Stop;
  destinationStop: Stop;
  calculation: RouteCalculationResult;
  selectedTrip: BusTrip;
  onSelectTrip: (trip: BusTrip) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const ScheduleSelectorStep: React.FC<ScheduleSelectorStepProps> = ({
  originStop,
  destinationStop,
  calculation,
  selectedTrip,
  onSelectTrip,
  onContinue,
}) => {
  const [dateFilter, setDateFilter] = useState<"today" | "tomorrow" | "calendar">("today");

  const formatTime12h = (time24: string) => {
    const [hStr, mStr] = time24.split(":");
    const h = parseInt(hStr, 10);
    const m = mStr || "00";
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12 < 10 ? `0${h12}` : h12}:${m} ${period}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-center space-y-2.5 sm:space-y-3.5 select-none">
      {/* 1. Resumen de Ruta en Tarjeta Flotante */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-md max-w-xl w-full mx-auto flex items-center justify-between border border-white/80">
        {/* Izquierda: Origen ➔ Destino + Distancia y Tiempo */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
              {originStop.name}
            </span>
            <span className="text-blue-500 font-bold text-sm">➔</span>
            <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
              {destinationStop.name}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
            <span>{calculation.distanceKm} km</span>
            <span>•</span>
            <span>~{calculation.formattedDuration}</span>
          </div>
        </div>

        {/* Derecha: Tarifa Normal y Preferencial */}
        <div className="flex flex-col items-end text-right">
          <div className="text-xs text-slate-600">
            Tarifa normal: <span className="font-extrabold text-slate-900 text-sm">${calculation.basePrice.toFixed(2)}</span>
          </div>
          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
            3ra Edad: ${(calculation.basePrice * 0.5).toFixed(2)} (-50%)
          </div>
        </div>
      </div>

      {/* 2. Selector de Fecha en Píldoras Centradas */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-xs gap-1 text-xs">
          <button
            type="button"
            onClick={() => setDateFilter("today")}
            className={`px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
              dateFilter === "today"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setDateFilter("tomorrow")}
            className={`px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
              dateFilter === "tomorrow"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            Mañana
          </button>
          <button
            type="button"
            onClick={() => setDateFilter("calendar")}
            className={`px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              dateFilter === "calendar"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendario</span>
          </button>
        </div>
      </div>

      {/* 3. Cuadrícula Táctil de Turnos/Horarios (Grid Simétrico 2x4 / 4x2 - 8 turnos) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {MOCK_BUS_TRIPS.slice(0, 8).map((trip) => {
          const isSelected = selectedTrip.id === trip.id;
          const { availableSeats } = getTripSeatAvailability(
            trip,
            originStop.stopOrder,
            destinationStop.stopOrder
          );
          const availableCount = availableSeats.length;
          const isLowAvailability = availableCount <= 6;

          // Disco / Unidad formateado
          const discoText = trip.busNumber.split(" - ")[0] || "Disco";
          const coopShort = trip.cooperativeName.replace("Transportes ", "").replace("Pullman ", "");

          return (
            <div
              key={trip.id}
              onClick={() => onSelectTrip(trip)}
              className={`p-3 sm:p-3.5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? "bg-white ring-4 ring-blue-500 border-blue-500 shadow-xl shadow-blue-500/20 scale-[1.02] z-10"
                  : "bg-white/90 backdrop-blur-md border border-white/80 shadow-md hover:shadow-xl hover:border-blue-400 hover:scale-[1.01] hover:bg-white"
              }`}
            >
              {/* Check discreto al estar seleccionado */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {/* Fila Superior: Hora Grande + Llegada */}
              <div>
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                    {formatTime12h(trip.departureTime)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                    Llega ~{trip.estimatedArrivalTime}
                  </span>
                </div>

                {/* Tipo de Unidad / Disco */}
                <div className="text-xs font-semibold text-slate-700 truncate">
                  {discoText} • {coopShort}
                </div>
              </div>

              {/* Fila Inferior: Disponibilidad + Servicios */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1">
                {/* Insignia de Disponibilidad */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLowAvailability
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isLowAvailability
                      ? `Últimos ${availableCount} asientos`
                      : `${availableCount} asientos disponibles`}
                  </span>
                </div>

                {/* Etiquetas de Servicios */}
                <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                  <span>Climatizado • WiFi • USB</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Botón Inferior Centrado: Continuar a Selección de Asiento */}
      <div className="flex justify-center pt-1 sm:pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
        >
          <span>Continuar a Selección de Asiento</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ScheduleSelectorStep;
