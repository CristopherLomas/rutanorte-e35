"use client";

import React, { useState, useEffect } from "react";
import { BusTrip, isSeatAvailableForSegment } from "@/core/mocks/tulcanIbarraData";
import { Check, Ban, Clock } from "lucide-react";
import { bookingService } from "../services/booking.service";

interface SeatMapGridProps {
  trip: BusTrip;
  fromStopOrder: number;
  toStopOrder: number;
  selectedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
}

export const SeatMapGrid: React.FC<SeatMapGridProps> = ({
  trip,
  fromStopOrder,
  toStopOrder,
  selectedSeats,
  onToggleSeat,
}) => {
  // Cuenta regresiva de reserva temporal (inicia en 04:59)
  const [timeLeft, setTimeLeft] = useState<number>(299);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  // Generamos una grilla típica de 40 asientos (10 filas de 4 asientos: [1,2] pasillo [3,4])
  const rows = [];
  for (let r = 0; r < 10; r++) {
    const seat1 = r * 4 + 1;
    const seat2 = r * 4 + 2;
    const seat3 = r * 4 + 3;
    const seat4 = r * 4 + 4;
    rows.push([seat1, seat2, seat3, seat4]);
  }

  const renderSeat = (seatNumber: number) => {
    const isAvailable = isSeatAvailableForSegment(
      trip.bookedSegments,
      seatNumber,
      fromStopOrder,
      toStopOrder
    );
    const isSelected = selectedSeats.includes(seatNumber);

    let buttonClass =
      "bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-400";
    let icon = <span className="font-mono text-[11px] font-bold">{seatNumber}</span>;

    if (isSelected) {
      buttonClass =
        "bg-blue-600 text-white font-bold border-blue-600 shadow-sm shadow-blue-500/25 scale-105 z-10";
      icon = <Check className="w-3 h-3 stroke-[3]" />;
    } else if (!isAvailable) {
      buttonClass =
        "bg-slate-100 text-slate-300 border-slate-200/80 cursor-not-allowed opacity-45";
      icon = <Ban className="w-3 h-3 text-slate-400" />;
    }

    const handleSeatClick = (seat: number) => {
      onToggleSeat(seat);
      if (!selectedSeats.includes(seat)) {
        bookingService.lockSeat({
          scheduleId: trip.id,
          seatNumber: seat,
          originStopId: fromStopOrder,
          destinationStopId: toStopOrder,
          originOrder: fromStopOrder,
          destOrder: toStopOrder,
        });
      }
    };

    return (
      <button
        key={seatNumber}
        type="button"
        disabled={!isAvailable}
        onClick={() => handleSeatClick(seatNumber)}
        className={`relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg border flex flex-col items-center justify-center transition-all duration-150 active:scale-95 ${buttonClass}`}
        title={
          !isAvailable
            ? `Asiento ${seatNumber}: Ocupado en este tramo`
            : `Asiento ${seatNumber}: Disponible`
        }
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center p-3 sm:p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 shadow-md text-slate-900 w-full max-w-xs mx-auto select-none">
      {/* 1. Temporizador Visual de Reserva */}
      <div className="w-full flex items-center justify-center gap-1.5 py-1 px-2.5 mb-2 rounded-full bg-amber-50 border border-amber-200/90 text-amber-800 text-[10px] sm:text-[11px] font-medium">
        <Clock className="w-3 h-3 text-amber-600 animate-pulse shrink-0" />
        <span>Asiento reservado temporalmente:</span>
        <span className="font-mono font-bold text-amber-900">{formatTimer(timeLeft)}</span>
      </div>

      {/* 2. Frente del Bus & Volante del Conductor */}
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs">
            {/* Ícono de Volante de Autobús */}
            <svg
              className="w-3.5 h-3.5 text-slate-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 0 0 20" />
              <path d="M12 12 4.93 7.93" />
              <path d="M12 12l7.07-4.07" />
              <path d="M12 12v10" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Conductor</span>
        </div>
        <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
          Frente del Bus
        </div>
      </div>

      {/* 3. Distribución de 40 Asientos (10 Filas Visibles Completas Sin Scroll) */}
      <div className="flex flex-col items-center gap-y-1 sm:gap-y-1.5 w-full py-0.5">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2 sm:gap-2.5">
            {/* Asientos Izquierda (Ventana / Pasillo) */}
            <div className="flex gap-1">
              {renderSeat(row[0])}
              {renderSeat(row[1])}
            </div>

            {/* Pasillo Central */}
            <div className="w-4 text-center text-[9px] text-slate-300 font-mono select-none">
              •
            </div>

            {/* Asientos Derecha (Pasillo / Ventana) */}
            <div className="flex gap-1">
              {renderSeat(row[2])}
              {renderSeat(row[3])}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Leyenda de Asientos */}
      <div className="w-full mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-300"></span>
          <span>Libre</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
          <span className="font-bold text-blue-600">Elegido</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span>
          <span className="text-slate-400">Ocupado</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMapGrid;
