import axiosClient from "@/core/api/axiosClient";

export interface ScanQrResponse {
  ticketId?: string;
  qrCodeHash: string;
  passengerName: string;
  passengerCedula: string;
  seatNumber: number;
  originStopName: string;
  destinationStopName: string;
  originOrder?: number;
  destOrder?: number;
  departureTime?: string;
  busNumber?: string;
  cooperativeName?: string;
  amountUSD: number;
  paymentMethod?: string;
  status: "PAGADO" | "PENDIENTE_EFECTIVO" | "EXPIRADO_CANCELADO";
  isBoarded?: boolean;
  boarded?: boolean;
  boardedAt?: string;
  isActionRequired?: boolean;
  verificationMessage?: string;
}

export interface CleanupResponse {
  success: boolean;
  cancelledCount: number;
  message: string;
}

export const boardingService = {
  /**
   * Escanea y valida un código QR en el backend Spring Boot
   */
  async scanQr(qrHash: string): Promise<ScanQrResponse> {
    try {
      const response = await axiosClient.get<ScanQrResponse>(
        `/boarding/scan-qr/${encodeURIComponent(qrHash)}`
      );
      return {
        ...response.data,
        boarded: response.data.isBoarded ?? response.data.boarded ?? false,
      };
    } catch (error) {
      console.warn(
        `[BoardingService] Endpoint /boarding/scan-qr falló o backend desconectado. Usando modo resiliente.`
      );
      throw error;
    }
  },

  /**
   * Confirma cobro en efectivo y marca al pasajero como abordado en Supabase
   */
  async confirmCashAndBoard(
    qrCodeHash: string,
    controllerNotes?: string
  ): Promise<ScanQrResponse> {
    try {
      const response = await axiosClient.post<ScanQrResponse>(
        "/boarding/confirm-cash-and-board",
        { qrCodeHash, controllerNotes }
      );
      return {
        ...response.data,
        boarded: response.data.isBoarded ?? response.data.boarded ?? true,
      };
    } catch (error) {
      console.warn(
        `[BoardingService] Endpoint /boarding/confirm-cash-and-board falló o backend desconectado.`
      );
      throw error;
    }
  },

  /**
   * Confirma abordaje de boleto ya pagado electrónicamente
   */
  async confirmBoarding(
    qrCodeHash: string,
    controllerNotes?: string
  ): Promise<ScanQrResponse> {
    try {
      const response = await axiosClient.post<ScanQrResponse>(
        "/boarding/confirm-boarding",
        { qrCodeHash, controllerNotes }
      );
      return {
        ...response.data,
        boarded: response.data.isBoarded ?? response.data.boarded ?? true,
      };
    } catch (error) {
      console.warn(
        `[BoardingService] Endpoint /boarding/confirm-boarding falló o backend desconectado.`
      );
      throw error;
    }
  },

  /**
   * Dispara limpieza de reservas en efectivo vencidas (15 min antes de salida)
   */
  async cleanupExpired(): Promise<CleanupResponse> {
    try {
      const response = await axiosClient.post<CleanupResponse>(
        "/boarding/cleanup-expired"
      );
      return response.data;
    } catch (error) {
      console.warn(
        `[BoardingService] Endpoint /boarding/cleanup-expired falló o backend desconectado.`
      );
      throw error;
    }
  },
};
