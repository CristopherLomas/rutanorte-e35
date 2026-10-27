"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Stop, TULCAN_IBARRA_STOPS } from "@/core/mocks/tulcanIbarraData";
import { RouteCalculationResult } from "../types";
import {
  ArrowUpDown,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  HeartHandshake,
  Compass,
} from "lucide-react";

interface RouteSelectorStepProps {
  stops: Stop[];
  originStop: Stop;
  destinationStop: Stop;
  onOriginChange: (stop: Stop) => void;
  onDestinationChange: (stop: Stop) => void;
  onSwapStops: () => void;
  calculation: RouteCalculationResult;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onContinue: () => void;
}

export const RouteSelectorStep: React.FC<RouteSelectorStepProps> = ({
  stops,
  originStop,
  destinationStop,
  onOriginChange,
  onDestinationChange,
  onSwapStops,
  calculation,
  selectedDate,
  onDateChange,
  onContinue,
}) => {
  // Opciones de fechas rápidas para Ecuador
  const quickDates = [
    { label: "Hoy", value: "today", sub: "Salidas cada 30 min" },
    { label: "Mañana", value: "tomorrow", sub: "Tarifa garantizada" },
    { label: "Fin de Semana", value: "weekend", sub: "Horarios expresos" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 md:p-5 rounded-3xl glass-panel border border-white/15 text-white shadow-2xl overflow-y-auto">
      {/* 1. Header con indicador de tramo */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
              Paso 1: Planifica tu Ruta Panamericana
            </span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
            E35 • 8 Paradas
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
          Selección de Parroquia & Tramo
        </h1>
        <p className="text-xs text-slate-400">
          Reutilización inteligente de asientos por tramos entre Carchi e Imbabura.
        </p>
      </div>

      {/* 2. Selectores de Origen y Destino con botón Swap integrado */}
      <div className="space-y-2.5 my-auto">
        {/* Tarjeta de Origen */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg relative group transition-all hover:border-emerald-500/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                A
              </span>
              <label className="text-[11px] uppercase tracking-wider text-emerald-300 font-extrabold">
                Parroquia / Ciudad de Origen
              </label>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Km {originStop.kmFromOrigin}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <Image
                src={originStop.imageUrl}
                alt={originStop.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <select
                value={originStop.id}
                onChange={(e) => {
                  const found = stops.find((s) => s.id === e.target.value);
                  if (found) onOriginChange(found);
                }}
                className="w-full bg-transparent text-sm md:text-base font-black text-white focus:outline-none cursor-pointer"
              >
                {stops.map((stop) => (
                  <option
                    key={`orig-${stop.id}`}
                    value={stop.id}
                    className="bg-slate-950 text-white"
                  >
                    #{stop.stopOrder} {stop.name} ({stop.canton}, {stop.province})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 truncate">
                {originStop.parish} • {originStop.elevationMeters} msnm
              </p>
            </div>
          </div>
        </div>

        {/* Botón de Invertir Origen y Destino (Swap) */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            type="button"
            onClick={onSwapStops}
            className="p-2.5 rounded-full bg-slate-900 border border-white/20 hover:border-emerald-400 text-slate-200 hover:text-emerald-300 shadow-xl transition-all duration-300 hover:scale-110 active:rotate-180"
            title="Invertir dirección del viaje"
          >
            <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Tarjeta de Destino */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-lg relative group transition-all hover:border-cyan-500/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold">
                B
              </span>
              <label className="text-[11px] uppercase tracking-wider text-cyan-300 font-extrabold">
                Parroquia / Ciudad de Destino
              </label>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Km {destinationStop.kmFromOrigin}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <Image
                src={destinationStop.imageUrl}
                alt={destinationStop.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <select
                value={destinationStop.id}
                onChange={(e) => {
                  const found = stops.find((s) => s.id === e.target.value);
                  if (found) onDestinationChange(found);
                }}
                className="w-full bg-transparent text-sm md:text-base font-black text-white focus:outline-none cursor-pointer"
              >
                {stops.map((stop) => (
                  <option
                    key={`dest-${stop.id}`}
                    value={stop.id}
                    disabled={stop.id === originStop.id}
                    className="bg-slate-950 text-white"
                  >
                    #{stop.stopOrder} {stop.name} ({stop.canton}, {stop.province})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 truncate">
                {destinationStop.parish} • {destinationStop.climate}
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Fecha Rápida */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>Fecha de Viaje:</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickDates.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => onDateChange(d.value)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  selectedDate === d.value
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <span className="text-xs block leading-tight font-bold">{d.label}</span>
                <span className="text-[9px] text-slate-400 block leading-tight truncate">
                  {d.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Paradas intermedias en el tramo */}
        {calculation.intermediateStopsCount > 0 && (
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">
              {calculation.intermediateStopsCount} paradas intermedias:
            </span>
            <div className="flex gap-1 overflow-x-auto max-w-[65%]">
              {calculation.intermediateStops.map((st) => (
                <span
                  key={st.id}
                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] whitespace-nowrap"
                >
                  {st.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Resumen Grande de Distancia, Tiempo, Precio y Descuento Tercera Edad */}
      <div className="shrink-0 mt-3 pt-3 border-t border-white/10 space-y-3">
        {/* Banner de Descuento Tercera Edad */}
        {calculation.isSeniorDiscountApplied && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 text-amber-200 flex items-center justify-between text-xs animate-fade-in shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-extrabold tracking-wide">
                Descuento Tercera Edad -50% Aplicado
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
              Ahorras ${calculation.savings.toFixed(2)}
            </span>
          </div>
        )}

        {/* Métricas Principales */}
        <div className="grid grid-cols-3 gap-2">
          {/* Distancia */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Distancia
            </span>
            <span className="text-base md:text-lg font-black text-white font-mono">
              {calculation.distanceKm} <span className="text-xs text-slate-400 font-normal">km</span>
            </span>
          </div>

          {/* Tiempo */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Tiempo Est.
            </span>
            <span className="text-base md:text-lg font-black text-cyan-300 font-mono">
              ~{calculation.formattedDuration}
            </span>
          </div>

          {/* Precio */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Tarifa / Boleto
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {calculation.isSeniorDiscountApplied && (
                <span className="text-xs line-through text-slate-500 font-mono">
                  ${calculation.basePrice.toFixed(2)}
                </span>
              )}
              <span className="text-base md:text-xl font-black text-emerald-400 font-mono">
                ${calculation.finalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Botón Elegir Horario y Asiento */}
        <button
          type="button"
          onClick={onContinue}
          disabled={originStop.id === destinationStop.id}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Elegir Horario y Asiento</span>
          <ChevronRight className="w-5 h-5 stroke-[3] transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default RouteSelectorStep;
