"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { BusTrip, Stop } from "@/core/mocks/tulcanIbarraData";
import {
  Printer,
  RotateCcw,
  Bus,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertTriangle,
  Download,
} from "lucide-react";

interface QrTicketStepProps {
  originStop: Stop;
  destinationStop: Stop;
  selectedTrip: BusTrip;
  selectedSeats: number[];
  passengerData: {
    fullName: string;
    cedula: string;
    phone: string;
    paymentMethod: string;
    totalAmount: number;
  };
  isSeniorCitizen?: boolean;
  onRestart: () => void;
}

export const QrTicketStep: React.FC<QrTicketStepProps> = ({
  originStop,
  destinationStop,
  selectedTrip,
  selectedSeats,
  passengerData,
  isSeniorCitizen = false,
  onRestart,
}) => {
  const isCashPayment = passengerData.paymentMethod === "efectivo";
  const ticketId = React.useMemo(
    () => `E35-${Math.floor(100000 + Math.random() * 900000)}`,
    []
  );

  // Payload completo para lectura del controlador con lector QR
  const qrPayload = JSON.stringify({
    ticketId,
    passenger: passengerData.fullName,
    cedula: passengerData.cedula,
    coop: selectedTrip.cooperativeName,
    disco: selectedTrip.busNumber,
    route: `${originStop.name} -> ${destinationStop.name}`,
    time: selectedTrip.departureTime,
    seats: selectedSeats,
    totalUSD: passengerData.totalAmount,
    status: isCashPayment ? "PENDIENTE_PAGO" : "PAGADO",
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center select-none py-1 sm:py-2">
      {/* Tarjeta de Embarque / Boleto Digital */}
      <div className="w-full rounded-3xl bg-white/95 backdrop-blur-md border border-white/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera Estilo Tarjeta de Embarque */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base tracking-tight leading-tight">
                Expreso Norte E35
              </h2>
              <p className="text-[10px] text-blue-100 font-medium">
                Boleto Electrónico de Transporte Interparroquial
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-blue-200 block font-semibold">
              Boleto Nº
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-white">
              {ticketId}
            </span>
          </div>
        </div>

        {/* Barra de Estado del Pago Destacada */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">Estado:</span>
            {isCashPayment ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PENDIENTE DE PAGO AL CONTROLADOR</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PAGADO</span>
              </span>
            )}
          </div>

          {isCashPayment && (
            <span className="text-[10px] font-bold text-amber-700 animate-pulse hidden sm:inline">
              Expira 15 min antes de la salida
            </span>
          )}
        </div>

        {/* Cuerpo Principal del Boleto */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Tramo y Horario */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-dashed border-slate-200">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Origen ➔ Destino
              </span>
              <div className="flex items-center gap-1.5 font-black text-sm sm:text-base text-slate-900 mt-0.5">
                <span>{originStop.name}</span>
                <span className="text-blue-500 font-bold">➔</span>
                <span>{destinationStop.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {selectedTrip.cooperativeName} • {selectedTrip.busNumber.split(" - ")[0]}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Hora de Salida
              </span>
              <span className="text-base sm:text-lg font-black text-blue-600 font-mono block mt-0.5">
                {selectedTrip.departureTime}
              </span>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 mt-0.5">
                <span>Asiento(s):</span>
                {selectedSeats.map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono font-bold"
                  >
                    #{s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Datos del Pasajero y Tarifa */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-dashed border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Pasajero Principal
              </span>
              <p className="font-bold text-slate-900 truncate mt-0.5">
                {passengerData.fullName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                C.I: {passengerData.cedula}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Tipo de Tarifa & Monto
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {isSeniorCitizen ? (
                  <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-amber-200">
                    Tercera Edad (-50%)
                  </span>
                ) : (
                  <span className="text-slate-700 text-[11px]">Tarifa Estándar</span>
                )}
              </p>
              <p className="text-sm font-black font-mono text-slate-900 mt-0.5">
                ${passengerData.totalAmount.toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* Código QR Central para Validación del Controlador */}
          <div className="flex flex-col items-center justify-center pt-1">
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200/80 shadow-md flex flex-col items-center">
              <QRCodeSVG
                value={qrPayload}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-2 font-semibold tracking-wide">
              {ticketId} • Presenta este código QR al abordar
            </p>
          </div>
        </div>

        {/* Botones Inferiores de Acción */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Boleto / Imprimir</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Comprar otro boleto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrTicketStep;
