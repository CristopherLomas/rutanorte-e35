export interface ValidationResult {
  ticketCode: string;
  passengerName: string;
  status: "VALID" | "INVALID" | "EXPIRED" | "ALREADY_USED";
  originStop: string;
  destinationStop: string;
  seatNumbers: number[];
  departureTime: string;
  message: string;
}
