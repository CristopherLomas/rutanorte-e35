import axiosClient from "@/core/api/axiosClient";
import { Stop, TULCAN_IBARRA_STOPS, calculateFare, calculateDistanceKm } from "@/core/mocks/tulcanIbarraData";

export interface BackendStopDto {
  id: number;
  name: string;
  province: string;
  stopOrder: number;
  latitude: number;
  longitude: number;
  kmFromStart: number;
  imageUrl?: string;
  description?: string;
}

export interface BackendFareResponse {
  originStopId: number;
  originStopName: string;
  destinationStopId: number;
  destinationStopName: string;
  distanceKm: number;
  formattedDuration: string;
  estimatedMinutes: number;
  basePrice: number;
  discountApplied: number;
  finalPrice: number;
  isSeniorDiscountApplied: boolean;
  intermediateStops: string[];
}

export const routesService = {
  // Obtener las 8 paradas desde el backend Spring Boot / Supabase
  async getStops(): Promise<Stop[]> {
    try {
      const response = await axiosClient.get<BackendStopDto[]>("/routes/stops");
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((dto) => {
          const localMock = TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === dto.stopOrder);
          return {
            id: localMock?.id || `stop-${dto.stopOrder}`,
            name: dto.name,
            parish: localMock?.parish || dto.name,
            canton: localMock?.canton || dto.province,
            province: (dto.province === "Imbabura" ? "Imbabura" : "Carchi") as "Carchi" | "Imbabura",
            type: localMock?.type || "Parada",
            stopOrder: dto.stopOrder,
            coordinates: {
              lat: dto.latitude,
              lng: dto.longitude,
            },
            kmFromOrigin: dto.kmFromStart,
            elevationMeters: localMock?.elevationMeters || 2500,
            climate: localMock?.climate || "Templado Andino",
            description: dto.description || localMock?.description || "",
            landmarks: localMock?.landmarks || [],
            imageUrl: localMock?.imageUrl || dto.imageUrl || "/images/stops/tulcan.jpg",
            backupUrl: localMock?.backupUrl,
          };
        });
      }
      return TULCAN_IBARRA_STOPS;
    } catch (error) {
      console.warn("[RoutesService] Backend no disponible. Usando datos oficiales del Corredor E35.");
      return TULCAN_IBARRA_STOPS;
    }
  },

  // Calcular tarifa en el backend Spring Boot
  async calculateFare(
    originOrder: number,
    destOrder: number,
    isSenior: boolean
  ): Promise<BackendFareResponse> {
    try {
      const response = await axiosClient.get<BackendFareResponse>("/routes/calculate-fare", {
        params: {
          originId: originOrder,
          destinationId: destOrder,
          isSeniorCitizen: isSenior,
        },
      });
      return response.data;
    } catch (error) {
      // Fallback a cálculo local
      const dist = calculateDistanceKm(originOrder, destOrder);
      const base = calculateFare(originOrder, destOrder);
      const discount = isSenior ? Math.round(base * 0.5 * 100) / 100 : 0;
      const finalP = isSenior ? Math.round((base - discount) * 100) / 100 : base;
      const mins = Math.max(15, Math.round(dist * 1.0));
      const hours = Math.floor(mins / 60);
      const m = mins % 60;
      const formatted = hours > 0 ? `${hours}h ${m}m` : `${m} min`;

      return {
        originStopId: originOrder,
        originStopName: TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === originOrder)?.name || "Origen",
        destinationStopId: destOrder,
        destinationStopName: TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === destOrder)?.name || "Destino",
        distanceKm: dist,
        formattedDuration: formatted,
        estimatedMinutes: mins,
        basePrice: base,
        discountApplied: discount,
        finalPrice: finalP,
        isSeniorDiscountApplied: isSenior,
        intermediateStops: [],
      };
    }
  },
};

export default routesService;
