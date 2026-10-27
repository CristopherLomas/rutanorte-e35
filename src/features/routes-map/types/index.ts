import { Stop } from "@/core/mocks/tulcanIbarraData";

export interface SelectedRouteSegment {
  originStop: Stop;
  destinationStop: Stop;
  distanceKm: number;
  estimatedMinutes: number;
  fare: number;
}

export interface MapViewportState {
  center: [number, number];
  zoom: number;
  activeStopId: string | null;
}

export interface RouteCalculationResult {
  distanceKm: number;
  estimatedMinutes: number;
  formattedDuration: string;
  basePrice: number;
  finalPrice: number;
  isSeniorDiscountApplied: boolean;
  savings: number;
  intermediateStops: Stop[];
  intermediateStopsCount: number;
}
