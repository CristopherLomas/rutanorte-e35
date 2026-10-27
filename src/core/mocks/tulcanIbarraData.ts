export interface Stop {
  id: string;
  name: string;
  parish: string;
  canton: string;
  province: 'Carchi' | 'Imbabura';
  stopOrder: number; // 1 to 8
  coordinates: {
    lat: number;
    lng: number;
  };
  kmFromOrigin: number; // Km from Tulcán (Km 0)
  elevationMeters: number;
  climate: string;
  description: string;
  landmarks: string[];
  imageUrl: string;
  backupUrl?: string;
  type?: string;
}

export interface SeatSegmentBooking {
  seatNumber: number;
  fromStopOrder: number;
  toStopOrder: number;
  passengerName?: string;
  ticketCode?: string;
}

export interface BusTrip {
  id: string;
  cooperativeName: string;
  busNumber: string;
  busType: 'Ejecutivo Panamericano' | 'Estándar Interparroquial' | 'Expreso E35';
  departureTime: string;
  estimatedArrivalTime: string;
  totalSeats: number;
  driverName: string;
  plate: string;
  amenities: string[];
  bookedSegments: SeatSegmentBooking[];
}

export const TULCAN_IBARRA_STOPS: Stop[] = [
  {
    id: "tulcan",
    name: "Tulcán",
    parish: "Terminal Terrestre de Tulcán",
    canton: "Tulcán",
    province: "Carchi",
    type: "Terminal Terrestre",
    stopOrder: 1,
    coordinates: {
      lat: 0.81187,
      lng: -77.71727,
    },
    kmFromOrigin: 0,
    elevationMeters: 2980,
    climate: "Frío Andino (8°C - 14°C)",
    description: "Centinela del Norte, cuna del célebre Cementerio de Esculturas en Ciprés 'José María Azaél Franco' y portal fronterizo de la Patria.",
    landmarks: ["Cementerio de Tulcán", "Parque Ayora", "Terminal Terrestre Tulcán"],
    imageUrl: "/images/stops/tulcan.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Cementerio%2C_Tulc%C3%A1n%2C_Ecuador%2C_2015-07-21%2C_DD_44.JPG",
  },
  {
    id: "julio-andrade",
    name: "Julio Andrade",
    parish: "Julio Andrade (La Orejuela)",
    canton: "Tulcán",
    province: "Carchi",
    type: "Parroquia Rural",
    stopOrder: 2,
    coordinates: {
      lat: 0.66250,
      lng: -77.72190,
    },
    kmFromOrigin: 21.5,
    elevationMeters: 2970,
    climate: "Frío de Páramo (9°C - 15°C)",
    description: "Principal emporio de la papa y lácteos del Carchi, cruce estratégico hacia la cordillera oriental y Sucumbíos.",
    landmarks: ["Plaza Central de la Papa", "Parroquia San Juan Bautista", "Mirador La Cocha"],
    imageUrl: "/images/stops/julio-andrade.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Vista_desde_Julio_Andrade%2C_Provincia_de_Carchi%2C_Ecuador%2C_2015-07-21%2C_DD_41.JPG",
  },
  {
    id: "huaca",
    name: "Huaca",
    parish: "San Pedro de Huaca",
    canton: "San Pedro de Huaca",
    province: "Carchi",
    type: "Centro Cantonal",
    stopOrder: 3,
    coordinates: {
      lat: 0.63190,
      lng: -77.72580,
    },
    kmFromOrigin: 28.0,
    elevationMeters: 2950,
    climate: "Frío Andino (9°C - 14°C)",
    description: "Tierra de profunda fe mariana con el Santuario de la Virgen de la Purita y pastizales lecheros de alta producción.",
    landmarks: ["Santuario Virgen de la Purita", "Complejo Arqueológico Huaca", "Reserva El Ángel Sur"],
    imageUrl: "/images/stops/huaca.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/7/71/C_Huaca_050202_%2817104419060%29.jpg",
  },
  {
    id: "san-gabriel",
    name: "San Gabriel",
    parish: "San Gabriel Centro",
    canton: "Montúfar",
    province: "Carchi",
    type: "Pueblo Mágico",
    stopOrder: 4,
    coordinates: {
      lat: 0.59640,
      lng: -77.83060,
    },
    kmFromOrigin: 42.0,
    elevationMeters: 2870,
    climate: "Templado-Frío (11°C - 17°C)",
    description: "Pueblo Mágico del Ecuador, célebre por su arquitectura colonial intacta, queso pastuso y la imponente Cascada de Paluz.",
    landmarks: ["Centro Histórico Colonial", "Cascada de Paluz", "Laguna de El Salado"],
    imageUrl: "/images/stops/san-gabriel.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Parque_de_San_Gabriel%2C_Carchi%2C_Ecuador.jpg",
  },
  {
    id: "bolivar",
    name: "Bolívar",
    parish: "Bolívar Centro",
    canton: "Bolívar",
    province: "Carchi",
    type: "Centro Cantonal",
    stopOrder: 5,
    coordinates: {
      lat: 0.50360,
      lng: -77.90390,
    },
    kmFromOrigin: 62.0,
    elevationMeters: 2600,
    climate: "Templado Andino (13°C - 20°C)",
    description: "Valle agrícola y paleontológico, guardián de fósiles de mastodontes, cuna del quesillo con miel y tierras fértiles.",
    landmarks: ["Museo Paleontológico", "Parque Central de Bolívar", "Cañón del Río Apaquí"],
    imageUrl: "/images/stops/bolivar.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Monumento_a_Sim%C3%B3n_Bol%C3%ADvar_en_parque_de_Bol%C3%ADvar%2C_Carchi-_Ecuador.jpg",
  },
  {
    id: "el-juncal",
    name: "El Juncal / Chota",
    parish: "Ambuquí - El Juncal",
    canton: "Ibarra",
    province: "Imbabura",
    type: "Valle del Chota",
    stopOrder: 6,
    coordinates: {
      lat: 0.46470,
      lng: -78.03720,
    },
    kmFromOrigin: 88.0,
    elevationMeters: 1600,
    climate: "Cálido Seco (20°C - 28°C)",
    description: "Corazón del Valle del Chota, cuna legendaria de talentos futbolísticos ecuatorianos, ritmo de bomba y cañaverales.",
    landmarks: ["Puente del Río Chota", "Cuna de la Bomba", "Canchas El Juncal"],
    imageUrl: "/images/stops/el-juncal.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Ama_la_Vida_-_Flickr_-_Valle_de_El_Chota_F_(8227391742).jpg",
  },
  {
    id: "ambuqui",
    name: "Ambuquí",
    parish: "Ambuquí",
    canton: "Ibarra",
    province: "Imbabura",
    type: "Parroquia Rural",
    stopOrder: 7,
    coordinates: {
      lat: 0.43310,
      lng: -78.01250,
    },
    kmFromOrigin: 96.0,
    elevationMeters: 1780,
    climate: "Cálido Subtropical (19°C - 27°C)",
    description: "Capital mundial del Ovo (ciruela dulce andina), rodeada de fincas hosterías, viñedos andinos y balnearios recreacionales.",
    landmarks: ["Monumento al Ovo", "Hosterías de Ambuquí", "Valle de Frutales"],
    imageUrl: "/images/stops/ambuqui.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/I_Ambuqui_0102_003_%2817107415508%29.jpg",
  },
  {
    id: "ibarra",
    name: "Ibarra",
    parish: "Terminal Terrestre de Ibarra",
    canton: "Ibarra",
    province: "Imbabura",
    type: "Terminal Terrestre",
    stopOrder: 8,
    coordinates: {
      lat: 0.35170,
      lng: -78.12230,
    },
    kmFromOrigin: 125.0,
    elevationMeters: 2225,
    climate: "Primaveral Templado (14°C - 23°C)",
    description: "La insigne 'Ciudad Blanca', coronada por el majestuoso Volcán Imbabura, los helados de paila y la mítica Laguna de Yahuarcocha.",
    landmarks: ["Laguna de Yahuarcocha", "Centro Histórico de la Ciudad Blanca", "Terminal Terrestre Ibarra"],
    imageUrl: "/images/stops/ibarra.jpg",
    backupUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Yahuarcocha2.JPG",
  },
];

export const FARE_RATE_PER_KM = 0.04;
export const MINIMUM_FARE = 0.75;

export function calculateFare(fromStopOrder: number, toStopOrder: number): number {
  const fromStop = TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === fromStopOrder);
  const toStop = TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === toStopOrder);

  if (!fromStop || !toStop || fromStopOrder === toStopOrder) {
    return MINIMUM_FARE;
  }

  const distanceKm = Math.abs(toStop.kmFromOrigin - fromStop.kmFromOrigin);
  const rawFare = distanceKm * FARE_RATE_PER_KM;
  const clampedFare = Math.max(MINIMUM_FARE, rawFare);

  return Math.round(clampedFare * 20) / 20;
}

export function calculateDistanceKm(fromStopOrder: number, toStopOrder: number): number {
  const fromStop = TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === fromStopOrder);
  const toStop = TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === toStopOrder);

  if (!fromStop || !toStop) return 0;
  return Math.abs(toStop.kmFromOrigin - fromStop.kmFromOrigin);
}

export function isSeatAvailableForSegment(
  bookedSegments: SeatSegmentBooking[],
  seatNumber: number,
  requestedFrom: number,
  requestedTo: number
): boolean {
  const minReq = Math.min(requestedFrom, requestedTo);
  const maxReq = Math.max(requestedFrom, requestedTo);

  const hasOverlap = bookedSegments.some((booking) => {
    if (booking.seatNumber !== seatNumber) return false;

    const minBooked = Math.min(booking.fromStopOrder, booking.toStopOrder);
    const maxBooked = Math.max(booking.fromStopOrder, booking.toStopOrder);

    return Math.max(minReq, minBooked) < Math.min(maxReq, maxBooked);
  });

  return !hasOverlap;
}

export function getTripSeatAvailability(
  trip: BusTrip,
  requestedFrom: number,
  requestedTo: number
): { availableSeats: number[]; occupiedSeats: number[] } {
  const availableSeats: number[] = [];
  const occupiedSeats: number[] = [];

  for (let seat = 1; seat <= trip.totalSeats; seat++) {
    if (isSeatAvailableForSegment(trip.bookedSegments, seat, requestedFrom, requestedTo)) {
      availableSeats.push(seat);
    } else {
      occupiedSeats.push(seat);
    }
  }

  return { availableSeats, occupiedSeats };
}

export const MOCK_BUS_TRIPS: BusTrip[] = [
  {
    id: "TRIP-CAR-101",
    cooperativeName: "Pullman Carchi",
    busNumber: "Disco 24 - El Centinela",
    busType: "Ejecutivo Panamericano",
    departureTime: "06:15",
    estimatedArrivalTime: "08:45",
    totalSeats: 40,
    driverName: "Segundo Benavides",
    plate: "CBA-1845",
    amenities: ["WiFi 5G", "Aire Acondicionado", "USB por asiento", "Asientos Reclinables 140°"],
    bookedSegments: [
      { seatNumber: 5, fromStopOrder: 1, toStopOrder: 4, passengerName: "Carlos Villarreal", ticketCode: "TCK-501" },
      { seatNumber: 6, fromStopOrder: 4, toStopOrder: 8, passengerName: "María Guamán", ticketCode: "TCK-502" },
      { seatNumber: 12, fromStopOrder: 3, toStopOrder: 6, passengerName: "Jairo Chalá", ticketCode: "TCK-503" },
      { seatNumber: 18, fromStopOrder: 1, toStopOrder: 8, passengerName: "Lucía Montalvo", ticketCode: "TCK-504" },
      { seatNumber: 20, fromStopOrder: 1, toStopOrder: 2, passengerName: "Milton Paspuel", ticketCode: "TCK-505" },
      { seatNumber: 20, fromStopOrder: 5, toStopOrder: 8, passengerName: "Rosa Anangonó", ticketCode: "TCK-506" },
      { seatNumber: 1, fromStopOrder: 1, toStopOrder: 4, passengerName: "Galo Chamorro", ticketCode: "TCK-507" },
      { seatNumber: 2, fromStopOrder: 1, toStopOrder: 8, passengerName: "Ana Revelo", ticketCode: "TCK-508" },
      { seatNumber: 9, fromStopOrder: 2, toStopOrder: 7, passengerName: "Nelson Delgado", ticketCode: "TCK-509" },
    ],
  },
  {
    id: "TRIP-EXP-204",
    cooperativeName: "Expreso Tulcán",
    busNumber: "Disco 12 - Fronterizo",
    busType: "Expreso E35",
    departureTime: "07:30",
    estimatedArrivalTime: "09:50",
    totalSeats: 40,
    driverName: "Wilson Bolaños",
    plate: "CBB-2034",
    amenities: ["WiFi 5G", "Climatizado", "Tomas 110V", "Pantallas HD"],
    bookedSegments: [
      { seatNumber: 3, fromStopOrder: 1, toStopOrder: 5, passengerName: "Elena Narváez", ticketCode: "TCK-601" },
      { seatNumber: 4, fromStopOrder: 1, toStopOrder: 8, passengerName: "Oswaldo Rosero", ticketCode: "TCK-602" },
      { seatNumber: 5, fromStopOrder: 1, toStopOrder: 3, passengerName: "Patricio Enríquez", ticketCode: "TCK-603" },
      { seatNumber: 5, fromStopOrder: 4, toStopOrder: 8, passengerName: "Gladys Méndez", ticketCode: "TCK-604" },
      { seatNumber: 15, fromStopOrder: 4, toStopOrder: 8, passengerName: "Kléber Congo", ticketCode: "TCK-605" },
      { seatNumber: 22, fromStopOrder: 6, toStopOrder: 8, passengerName: "Byron Delgado", ticketCode: "TCK-606" },
    ],
  },
  {
    id: "TRIP-UNI-308",
    cooperativeName: "Transportes Unidos",
    busNumber: "Disco 08 - Ciudad Blanca",
    busType: "Estándar Interparroquial",
    departureTime: "09:00",
    estimatedArrivalTime: "11:30",
    totalSeats: 40,
    driverName: "Jaime Ipiales",
    plate: "IAA-3341",
    amenities: ["Música Andina y Bomba", "Cargadores USB", "Ventilación Dual"],
    bookedSegments: [
      { seatNumber: 7, fromStopOrder: 1, toStopOrder: 8, passengerName: "Silvia Portilla", ticketCode: "TCK-701" },
      { seatNumber: 8, fromStopOrder: 1, toStopOrder: 4, passengerName: "Edwin Pozo", ticketCode: "TCK-702" },
      { seatNumber: 10, fromStopOrder: 3, toStopOrder: 8, passengerName: "Martha Padilla", ticketCode: "TCK-703" },
    ],
  },
  {
    id: "TRIP-CAR-412",
    cooperativeName: "Pullman Carchi",
    busNumber: "Disco 31 - Pastuso Veloz",
    busType: "Ejecutivo Panamericano",
    departureTime: "11:15",
    estimatedArrivalTime: "13:40",
    totalSeats: 40,
    driverName: "Hernán Cuásquer",
    plate: "CBA-3912",
    amenities: ["WiFi 5G", "Aire Acondicionado", "USB por asiento", "Cafetería a bordo"],
    bookedSegments: [
      { seatNumber: 5, fromStopOrder: 1, toStopOrder: 4, passengerName: "Carmen Vallejo", ticketCode: "TCK-801" },
      { seatNumber: 11, fromStopOrder: 2, toStopOrder: 6, passengerName: "Fabian Lara", ticketCode: "TCK-802" },
      { seatNumber: 25, fromStopOrder: 1, toStopOrder: 8, passengerName: "Daniela Ruiz", ticketCode: "TCK-803" },
    ],
  },
  {
    id: "TRIP-EXP-515",
    cooperativeName: "Expreso Tulcán",
    busNumber: "Disco 45 - Pupo de Oro",
    busType: "Expreso E35",
    departureTime: "13:30",
    estimatedArrivalTime: "15:50",
    totalSeats: 40,
    driverName: "Manuel Yandún",
    plate: "CBB-4902",
    amenities: ["WiFi 5G", "Climatizado", "USB", "Seguimiento GPS Satelital"],
    bookedSegments: [
      { seatNumber: 14, fromStopOrder: 1, toStopOrder: 8, passengerName: "Esteban Coral", ticketCode: "TCK-901" },
      { seatNumber: 15, fromStopOrder: 1, toStopOrder: 4, passengerName: "Teresa Folleco", ticketCode: "TCK-902" },
      { seatNumber: 19, fromStopOrder: 6, toStopOrder: 8, passengerName: "Washington Carcelén", ticketCode: "TCK-903" },
    ],
  },
  {
    id: "TRIP-UNI-620",
    cooperativeName: "Transportes Unidos",
    busNumber: "Disco 17 - El Retorno",
    busType: "Estándar Interparroquial",
    departureTime: "16:00",
    estimatedArrivalTime: "18:25",
    totalSeats: 40,
    driverName: "Ángel Chandi",
    plate: "IAA-4890",
    amenities: ["Música Ambiental", "Cargadores USB", "Ventilación Panorámica"],
    bookedSegments: [
      { seatNumber: 5, fromStopOrder: 1, toStopOrder: 4, passengerName: "Jorge Morillo", ticketCode: "TCK-1001" },
      { seatNumber: 21, fromStopOrder: 4, toStopOrder: 8, passengerName: "Inés Folleco", ticketCode: "TCK-1002" },
    ],
  },
  {
    id: "TRIP-CAR-725",
    cooperativeName: "Pullman Carchi",
    busNumber: "Disco 05 - Nieve en Los Frailejones",
    busType: "Ejecutivo Panamericano",
    departureTime: "18:30",
    estimatedArrivalTime: "20:55",
    totalSeats: 40,
    driverName: "Ramiro Cárdenas",
    plate: "CBA-5011",
    amenities: ["WiFi 5G", "Calefacción Andina", "USB por asiento", "Luz de lectura LED"],
    bookedSegments: [
      { seatNumber: 1, fromStopOrder: 1, toStopOrder: 8, passengerName: "Valeria Moncayo", ticketCode: "TCK-1101" },
      { seatNumber: 2, fromStopOrder: 1, toStopOrder: 8, passengerName: "Gabriel Moncayo", ticketCode: "TCK-1102" },
    ],
  },
  {
    id: "TRIP-EXP-830",
    cooperativeName: "Expreso Tulcán",
    busNumber: "Disco 04 - Fronterizo Nocturno",
    busType: "Expreso E35",
    departureTime: "20:15",
    estimatedArrivalTime: "22:30",
    totalSeats: 40,
    driverName: "Marcelo Cuarán",
    plate: "CBB-6110",
    amenities: ["WiFi 5G", "Climatizado", "USB por asiento", "Seguridad Satelital"],
    bookedSegments: [
      { seatNumber: 8, fromStopOrder: 1, toStopOrder: 8, passengerName: "Christian Pozo", ticketCode: "TCK-1201" },
      { seatNumber: 16, fromStopOrder: 1, toStopOrder: 4, passengerName: "Diana Benavides", ticketCode: "TCK-1202" },
      { seatNumber: 27, fromStopOrder: 3, toStopOrder: 8, passengerName: "Rodrigo Erazo", ticketCode: "TCK-1203" },
    ],
  },
];
