import { BusTrip } from "@/core/mocks/tulcanIbarraData";

export type SeatStatus = "available" | "selected" | "occupied";

export interface SeatInfo {
  seatNumber: number;
  status: SeatStatus;
  price: number;
}

export interface SeatSelectionState {
  selectedSeats: number[];
  selectedTrip: BusTrip | null;
  fromStopOrder: number;
  toStopOrder: number;
}
