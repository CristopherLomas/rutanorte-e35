"use client";

import React from "react";
import { Stop } from "@/core/mocks/tulcanIbarraData";
import { Check } from "lucide-react";

interface StopCardsGridProps {
  stops: Stop[];
  selectedStop: Stop | null;
  onSelectStop: (stop: Stop) => void;
  disabledStopId?: string;
  minAllowedStopOrder?: number;
}

const STOPS_DATA = [
  {
    id: 1,
    name: "Tulcán",
    province: "Carchi",
    type: "Terminal Terrestre",
    imageUrl: "/images/stops/tulcan.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Cementerio%2C_Tulc%C3%A1n%2C_Ecuador%2C_2015-07-21%2C_DD_44.JPG"
  },
  {
    id: 2,
    name: "Julio Andrade",
    province: "Carchi",
    type: "Parroquia Rural",
    imageUrl: "/images/stops/julio-andrade.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Vista_desde_Julio_Andrade%2C_Provincia_de_Carchi%2C_Ecuador%2C_2015-07-21%2C_DD_41.JPG"
  },
  {
    id: 3,
    name: "Huaca",
    province: "Carchi",
    type: "Centro Cantonal",
    imageUrl: "/images/stops/huaca.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/7/71/C_Huaca_050202_%2817104419060%29.jpg"
  },
  {
    id: 4,
    name: "San Gabriel",
    province: "Carchi",
    type: "Pueblo Mágico",
    imageUrl: "/images/stops/san-gabriel.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Parque_de_San_Gabriel%2C_Carchi%2C_Ecuador.jpg"
  },
  {
    id: 5,
    name: "Bolívar",
    province: "Carchi",
    type: "Centro Cantonal",
    imageUrl: "/images/stops/bolivar.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Monumento_a_Sim%C3%B3n_Bol%C3%ADvar_en_parque_de_Bol%C3%ADvar%2C_Carchi-_Ecuador.jpg"
  },
  {
    id: 6,
    name: "El Juncal / Chota",
    province: "Imbabura",
    type: "Valle del Chota",
    imageUrl: "/images/stops/el-juncal.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Ama_la_Vida_-_Flickr_-_Valle_de_El_Chota_F_(8227391742).jpg"
  },
  {
    id: 7,
    name: "Ambuquí",
    province: "Imbabura",
    type: "Parroquia Rural",
    imageUrl: "/images/stops/ambuqui.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/I_Ambuqui_0102_003_%2817107415508%29.jpg"
  },
  {
    id: 8,
    name: "Ibarra",
    province: "Imbabura",
    type: "Terminal Terrestre",
    imageUrl: "/images/stops/ibarra.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Yahuarcocha2.JPG"
  }
];

export const StopCardsGrid: React.FC<StopCardsGridProps> = ({
  stops,
  selectedStop,
  onSelectStop,
  disabledStopId,
  minAllowedStopOrder,
}) => {
  // Sobreescribe y enriquece las paradas con los datos y fotos exactas de STOPS_DATA
  const activeStops = stops.map((stop) => {
    const data = STOPS_DATA.find(
      (s) => s.id === stop.stopOrder || s.name.toLowerCase() === stop.name.toLowerCase()
    );
    return {
      ...stop,
      imageUrl: data?.imageUrl || stop.imageUrl,
      backupUrl: data?.backupUrl,
      type: data?.type || stop.parish,
    };
  });

  const carchiStops = activeStops.filter((s) => s.province === "Carchi");
  const imbaburaStops = activeStops.filter((s) => s.province === "Imbabura");

  const renderCard = (stop: Stop & { backupUrl?: string; type?: string }) => {
    const isSelected = selectedStop?.id === stop.id;
    const isOrigin = disabledStopId === stop.id;
    const isBehindOrigin = minAllowedStopOrder !== undefined && stop.stopOrder < minAllowedStopOrder;
    const isDisabled = isOrigin || isBehindOrigin;

    return (
      <div
        key={stop.id}
        onClick={() => !isDisabled && onSelectStop(stop)}
        className={`w-full relative rounded-xl bg-white/90 backdrop-blur-md border transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col select-none ${
          isDisabled
            ? "opacity-35 cursor-not-allowed filter grayscale border-slate-200/80 pointer-events-none"
            : isSelected
            ? "ring-4 ring-blue-500 border-blue-500 shadow-xl shadow-blue-500/25 scale-[1.02] z-10"
            : "border-white/60 shadow-lg hover:shadow-2xl hover:border-blue-400 hover:scale-[1.02]"
        }`}
      >
        {/* FOTO SUPERIOR COMPACTA (h-28 o h-30) CON FALLBACK <img> */}
        <div className="relative w-full h-28 sm:h-30 md:h-32 overflow-hidden bg-slate-200 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stop.imageUrl}
            alt={stop.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (stop.backupUrl && target.src !== stop.backupUrl) {
                target.src = stop.backupUrl;
              }
            }}
          />

          {/* Check visual discreto al estar seleccionado */}
          {isSelected && (
            <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-fade-in">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}

          {isOrigin && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                Origen
              </span>
            </div>
          )}

          {!isOrigin && isBehindOrigin && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-slate-800/70 backdrop-blur-md text-white/90 text-[9px] font-medium px-1.5 py-0.5 rounded-full shadow-sm">
                Ruta Norte
              </span>
            </div>
          )}
        </div>

        {/* CONTENIDO INFERIOR CENTRADO: SOLO EL NOMBRE DE LA CIUDAD/PARROQUIA */}
        <div className="py-2.5 px-2 bg-white/80 backdrop-blur-sm flex items-center justify-center text-center">
          <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors leading-tight truncate w-full">
            {stop.name}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* SECCIÓN 1: PROVINCIA DEL CARCHI (5 Paradas) */}
      <div>
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <div className="w-12 sm:w-24 md:w-36 h-px bg-slate-300/70" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Provincia del Carchi
            </h2>
          </div>
          <div className="w-12 sm:w-24 md:w-36 h-px bg-slate-300/70" />
        </div>

        {/* Grid equilibrado de 5 columnas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5">
          {carchiStops.map(renderCard)}
        </div>
      </div>

      {/* SECCIÓN 2: PROVINCIA DE IMBABURA (3 Paradas - Centradas simétricamente) */}
      <div>
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <div className="w-12 sm:w-24 md:w-36 h-px bg-slate-300/70" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Provincia de Imbabura
            </h2>
          </div>
          <div className="w-12 sm:w-24 md:w-36 h-px bg-slate-300/70" />
        </div>

        {/* 3 Paradas centradas con el mismo ancho proporcional de las 5 superiores */}
        <div className="flex justify-center gap-3 sm:gap-3.5">
          {imbaburaStops.map((stop) => (
            <div
              key={stop.id}
              className="w-1/2 sm:w-1/3 md:w-[calc((100%-4*0.875rem)/5)] min-w-[130px] max-w-[240px]"
            >
              {renderCard(stop)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StopCardsGrid;
