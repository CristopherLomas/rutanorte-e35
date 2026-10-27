"use client";

import { useMemo } from "react";
import { Stop, calculateFare, TULCAN_IBARRA_STOPS } from "@/core/mocks/tulcanIbarraData";
import { RouteCalculationResult } from "../types";

export function useRouteCalculator(
  originStop: Stop | null,
  destinationStop: Stop | null,
  isSeniorCitizen: boolean = false
): RouteCalculationResult {
  return useMemo(() => {
    if (!originStop || !destinationStop) {
      return {
        distanceKm: 0,
        estimatedMinutes: 0,
        formattedDuration: "0 min",
        basePrice: 0,
        finalPrice: 0,
        isSeniorDiscountApplied: false,
        savings: 0,
        intermediateStops: [],
        intermediateStopsCount: 0,
      };
    }

    // Distancia en km entre origen y destino
    const distanceKm = Math.abs(destinationStop.kmFromOrigin - originStop.kmFromOrigin);

    // Paradas intermedias
    const minOrder = Math.min(originStop.stopOrder, destinationStop.stopOrder);
    const maxOrder = Math.max(originStop.stopOrder, destinationStop.stopOrder);

    // Lista ordenada de paradas en el sentido del viaje
    const isForward = originStop.stopOrder <= destinationStop.stopOrder;
    const intermediateStops = TULCAN_IBARRA_STOPS.filter(
      (s) => s.stopOrder > minOrder && s.stopOrder < maxOrder
    ).sort((a, b) => (isForward ? a.stopOrder - b.stopOrder : b.stopOrder - a.stopOrder));

    const intermediateStopsCount = intermediateStops.length;

    // Tiempo estimado: 1 min por km + 5 min por parada intermedia (desaceleración, abordaje y arranque)
    const rawMinutes = Math.round(distanceKm * 1.0) + intermediateStopsCount * 5;
    const estimatedMinutes = Math.max(10, rawMinutes);

    // Formateo legible de horas y minutos
    const hours = Math.floor(estimatedMinutes / 60);
    const mins = estimatedMinutes % 60;
    const formattedDuration =
      hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim() : `${mins} min`;

    // Tarifa base calculada
    const basePrice = calculateFare(originStop.stopOrder, destinationStop.stopOrder);

    // Descuento Tercera Edad (65+ años) / Ley Orgánica del Adulto Mayor en Ecuador (50%)
    const isSeniorDiscountApplied = isSeniorCitizen && basePrice > 0;
    const finalPrice = isSeniorDiscountApplied
      ? Math.round((basePrice * 0.5) * 100) / 100
      : basePrice;

    const savings = Math.round((basePrice - finalPrice) * 100) / 100;

    return {
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedMinutes,
      formattedDuration,
      basePrice,
      finalPrice,
      isSeniorDiscountApplied,
      savings,
      intermediateStops,
      intermediateStopsCount,
    };
  }, [originStop, destinationStop, isSeniorCitizen]);
}

export default useRouteCalculator;
