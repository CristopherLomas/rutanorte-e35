"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Stop } from "@/core/mocks/tulcanIbarraData";
import { Navigation, Clock, Mountain, MapPin, Sparkles, CheckCircle2 } from "lucide-react";

interface LeafletRouteMapInnerProps {
  stops: Stop[];
  originStop: Stop;
  destinationStop: Stop;
  activeStop: Stop;
  onSelectStop?: (stop: Stop) => void;
  distanceKm: number;
  formattedDuration: string;
  isSeniorDiscountApplied?: boolean;
}

// Subcomponente para animar la cámara (fitBounds o flyTo)
function RouteBoundsAdjuster({
  bounds,
}: {
  bounds: L.LatLngBoundsExpression | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, {
        padding: [60, 60],
        maxZoom: 13,
        duration: 1.2,
      });
    }
  }, [bounds, map]);
  return null;
}

export default function LeafletRouteMapInner({
  stops,
  originStop,
  destinationStop,
  activeStop,
  onSelectStop,
  distanceKm,
  formattedDuration,
  isSeniorDiscountApplied,
}: LeafletRouteMapInnerProps) {
  // Centro por defecto entre Tulcán e Ibarra
  const defaultCenter: [number, number] = [0.58, -77.92];

  // Estado para la geometría vial precisa de OSRM
  const [osrmRoutePoints, setOsrmRoutePoints] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeSource, setRouteSource] = useState<"OSRM" | "INTERPOLATED">("OSRM");

  // Paradas en el sentido del viaje
  const isForward = originStop.stopOrder <= destinationStop.stopOrder;
  const minOrder = Math.min(originStop.stopOrder, destinationStop.stopOrder);
  const maxOrder = Math.max(originStop.stopOrder, destinationStop.stopOrder);

  // Paradas pertenecientes al tramo seleccionado
  const selectedSegmentStops = useMemo(() => {
    return stops
      .filter((s) => s.stopOrder >= minOrder && s.stopOrder <= maxOrder)
      .sort((a, b) => (isForward ? a.stopOrder - b.stopOrder : b.stopOrder - a.stopOrder));
  }, [stops, minOrder, maxOrder, isForward]);

  // Coordenadas de todo el corredor Panamericana E35 para la línea base
  const allCorridorCoords: [number, number][] = useMemo(() => {
    return stops.map((s) => [s.coordinates.lat, s.coordinates.lng]);
  }, [stops]);

  // Consulta a la API pública de OSRM para obtener la traza vial real
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function fetchOsrmRoute() {
      setIsLoadingRoute(true);
      try {
        const originLng = originStop.coordinates.lng;
        const originLat = originStop.coordinates.lat;
        const destLng = destinationStop.coordinates.lng;
        const destLat = destinationStop.coordinates.lat;

        // OSRM acepta: lng,lat;lng,lat
        const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

        // Timeout preventivo de 3.5 segundos para no bloquear la UI si OSRM demora
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`OSRM HTTP error ${response.status}`);
        }

        const data = await response.json();

        if (
          !isCancelled &&
          data.routes &&
          data.routes.length > 0 &&
          data.routes[0].geometry?.coordinates
        ) {
          // OSRM devuelve [lng, lat], Leaflet espera [lat, lng]
          const mappedCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          setOsrmRoutePoints(mappedCoords);
          setRouteSource("OSRM");
        } else {
          throw new Error("No route geometry returned");
        }
      } catch (err) {
        if (!isCancelled) {
          // Fallback seguro: polilínea interpolada a través de las coordenadas de las paradas intermedias
          const fallbackCoords: [number, number][] = selectedSegmentStops.map((s) => [
            s.coordinates.lat,
            s.coordinates.lng,
          ]);
          setOsrmRoutePoints(fallbackCoords);
          setRouteSource("INTERPOLATED");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRoute(false);
        }
      }
    }

    fetchOsrmRoute();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [originStop, destinationStop, selectedSegmentStops]);

  // Calcular bounds para auto-fit
  const mapBounds: L.LatLngBoundsExpression | null = useMemo(() => {
    if (osrmRoutePoints.length > 1) {
      return L.latLngBounds(osrmRoutePoints);
    }
    return L.latLngBounds([
      [originStop.coordinates.lat, originStop.coordinates.lng],
      [destinationStop.coordinates.lat, destinationStop.coordinates.lng],
    ]);
  }, [osrmRoutePoints, originStop, destinationStop]);

  // Función para generar iconos SVG personalizados de cada parada
  const createStopMarkerIcon = (stop: Stop) => {
    const isOrigin = stop.id === originStop.id;
    const isDestination = stop.id === destinationStop.id;
    const isActive = stop.id === activeStop.id;
    const isInRoute = stop.stopOrder >= minOrder && stop.stopOrder <= maxOrder;

    let markerColor = "bg-slate-800 text-slate-300 border-white/30";
    let pulseRing = "";
    let badgeText = `${stop.stopOrder}`;
    let roleLabel = "";

    if (isOrigin) {
      markerColor = "bg-emerald-500 text-slate-950 font-black border-white shadow-emerald-500/50";
      pulseRing = "ring-4 ring-emerald-500/50 animate-pulse";
      roleLabel = `<div class="absolute -top-6 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-lg">ORIGEN</div>`;
    } else if (isDestination) {
      markerColor = "bg-cyan-500 text-slate-950 font-black border-white shadow-cyan-500/50";
      pulseRing = "ring-4 ring-cyan-500/50 animate-pulse";
      roleLabel = `<div class="absolute -top-6 px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-lg">DESTINO</div>`;
    } else if (isInRoute) {
      markerColor = "bg-teal-600 text-white font-bold border-teal-300";
    } else if (isActive) {
      markerColor = "bg-amber-500 text-slate-950 font-black border-white";
      pulseRing = "ring-4 ring-amber-500/40";
    }

    const html = `
      <div class="relative flex flex-col items-center justify-center">
        ${roleLabel}
        <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs shadow-2xl transition-all duration-300 hover:scale-125 ${markerColor} ${pulseRing}">
          ${badgeText}
        </div>
        <div class="mt-1 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 shadow-md">
          ${stop.name}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-leaflet-marker",
      iconSize: [36, 44],
      iconAnchor: [18, 22],
    });
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <RouteBoundsAdjuster bounds={mapBounds} />

        {/* Capa de OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | OSRM E35'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Línea base del corredor completo Tulcán - Ibarra */}
        <Polyline
          positions={allCorridorCoords}
          pathOptions={{
            color: "#64748b",
            weight: 3,
            opacity: 0.45,
            dashArray: "4, 8",
          }}
        />

        {/* 2. Trazo vial real del tramo seleccionado (OSRM o interpolado) */}
        {osrmRoutePoints.length > 0 && (
          <>
            {/* Halo de resplandor vial */}
            <Polyline
              positions={osrmRoutePoints}
              pathOptions={{
                color: "#10b981",
                weight: 8,
                opacity: 0.4,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Línea principal cian/esmeralda */}
            <Polyline
              positions={osrmRoutePoints}
              pathOptions={{
                color: "#06b6d4",
                weight: 4,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {/* 3. Marcadores de las 8 paradas */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.coordinates.lat, stop.coordinates.lng]}
            icon={createStopMarkerIcon(stop)}
            eventHandlers={{
              click: () => onSelectStop && onSelectStop(stop),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-slate-900 min-w-[180px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Parada #{stop.stopOrder}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Km {stop.kmFromOrigin}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{stop.name}</h4>
                <p className="text-xs text-slate-600 mb-2">{stop.parish}</p>
                <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                  <span>{stop.elevationMeters} msnm</span>
                  <span>{stop.climate.split(" ")[0]}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Widgets flotantes informativos sobre el mapa */}
      {/* Widget Superior Izquierdo: Ruta Activa E35 & Estado OSRM */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-white/20 text-white shadow-xl flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-bold tracking-tight">
            {originStop.name} ➔ {destinationStop.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({distanceKm} Km)
          </span>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>
            {isLoadingRoute
              ? "Calculando geometría OSRM..."
              : routeSource === "OSRM"
              ? "Vía Panamericana E35 (Trazo OSRM Real)"
              : "Trazo Interpolado Corredor E35"}
          </span>
        </div>
      </div>

      {/* Widget Inferior Flotante: Métricas en vivo del tramo */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] p-3 rounded-2xl bg-slate-950/85 backdrop-blur-2xl border border-white/20 text-white shadow-2xl pointer-events-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Tramo en Vivo
              </p>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{originStop.name}</span>
                <span className="text-emerald-400">➔</span>
                <span>{destinationStop.name}</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Tiempo</span>
                <span className="font-mono font-bold text-slate-200">~{formattedDuration}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Desnivel</span>
                <span className="font-mono font-bold text-slate-200">
                  {Math.abs(originStop.elevationMeters - destinationStop.elevationMeters)} m
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Distancia</span>
                <span className="font-mono font-bold text-emerald-300">{distanceKm} Km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
