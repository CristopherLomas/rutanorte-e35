export interface RouteKpiMetrics {
  totalPassengersToday: number;
  totalRevenueUSD: number;
  activeFleetCount: number;
  corridorOccupancyRate: number; // Porcentaje
  punctualityRate: number; // Porcentaje
}

export interface CooperativeStat {
  name: string;
  activeBuses: number;
  passengersMoved: number;
  revenue: number;
}
