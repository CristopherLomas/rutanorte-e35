export interface PassengerData {
  fullName: string;
  cedulaOrPassport: string;
  email: string;
  phone: string;
}

export interface TicketReceipt {
  ticketId: string;
  passenger: PassengerData;
  tripId: string;
  cooperative: string;
  busNumber: string;
  departureTime: string;
  originName: string;
  destinationName: string;
  seatNumbers: number[];
  totalPaid: number;
  qrPayload: string;
  purchaseDate: string;
}
