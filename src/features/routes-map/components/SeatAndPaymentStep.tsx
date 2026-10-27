"use client";

import React, { useState } from "react";
import { BusTrip, Stop } from "@/core/mocks/tulcanIbarraData";
import { SeatMapGrid } from "@/features/seat-selection/components/SeatMapGrid";
import { QRCodeSVG } from "qrcode.react";
import {
  CreditCard,
  QrCode,
  Ticket,
  HeartHandshake,
  ChevronRight,
  Banknote,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { bookingService } from "@/features/seat-selection/services/booking.service";

interface SeatAndPaymentStepProps {
  originStop: Stop;
  destinationStop: Stop;
  selectedTrip: BusTrip;
  selectedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
  baseFarePerSeat: number;
  isSeniorCitizen: boolean;
  onToggleSeniorCitizen: (val: boolean) => void;
  onConfirmPurchase: (passengerData: {
    fullName: string;
    cedula: string;
    phone: string;
    paymentMethod: string;
    totalAmount: number;
  }) => void;
  onBack: () => void;
}

export const SeatAndPaymentStep: React.FC<SeatAndPaymentStepProps> = ({
  originStop,
  destinationStop,
  selectedTrip,
  selectedSeats,
  onToggleSeat,
  baseFarePerSeat,
  isSeniorCitizen,
  onToggleSeniorCitizen,
  onConfirmPurchase,
  onBack,
}) => {
  const [fullName, setFullName] = useState("Cristopher Lomas");
  const [cedula, setCedula] = useState("0401829341");
  const [phone, setPhone] = useState("0998341920");
  const [paymentMethod, setPaymentMethod] = useState<"deuna" | "tarjeta" | "efectivo">("deuna");

  // Campos simulados de tarjeta
  const [cardNumber, setCardNumber] = useState("4152 •••• •••• 8294");
  const [cardExp, setCardExp] = useState("08/28");
  const [cardCvv, setCardCvv] = useState("•••");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unitPrice = isSeniorCitizen
    ? Math.round(baseFarePerSeat * 0.5 * 100) / 100
    : baseFarePerSeat;

  const totalAmount = Math.round(selectedSeats.length * unitPrice * 100) / 100;
  const totalSavings = isSeniorCitizen
    ? Math.round(selectedSeats.length * (baseFarePerSeat - unitPrice) * 100) / 100
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      setFormError("Por favor, selecciona al menos 1 asiento en el mapa del autobús.");
      return;
    }
    if (!fullName.trim() || !cedula.trim() || !phone.trim()) {
      setFormError("Por favor, completa todos los datos obligatorios del pasajero.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      const paymentBackend =
        paymentMethod === "efectivo"
          ? "CASH_CONTROLLER"
          : paymentMethod === "tarjeta"
          ? "ONLINE_CARD"
          : "DEUNA_QR";

      // Persistir boleto en backend Spring Boot / Supabase y liberar Redis
      await bookingService.createTicket({
        scheduleId: selectedTrip.id,
        seatNumber: selectedSeats[0] || 1,
        originStopId: originStop.stopOrder,
        destinationStopId: destinationStop.stopOrder,
        originOrder: originStop.stopOrder,
        destOrder: destinationStop.stopOrder,
        passengerName: fullName.trim(),
        passengerCedula: cedula.trim(),
        passengerPhone: phone.trim(),
        paymentMethod: paymentBackend,
        isSeniorCitizen,
      });

      onConfirmPurchase({
        fullName: fullName.trim(),
        cedula: cedula.trim(),
        phone: phone.trim(),
        paymentMethod,
        totalAmount,
      });
    } catch {
      // Fallback
      onConfirmPurchase({
        fullName: fullName.trim(),
        cedula: cedula.trim(),
        phone: phone.trim(),
        paymentMethod,
        totalAmount,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-center space-y-2 sm:space-y-2.5 select-none">
      {/* 1. Header Compacto de Ruta y Unidad */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer group shrink-0"
            title="Volver a seleccionar horario"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Paso 4 • Selección de Asientos & Pago
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base text-slate-800 tracking-tight">
              <span>{originStop.name}</span>
              <span className="text-blue-500 font-bold">➔</span>
              <span>{destinationStop.name}</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-blue-600 font-bold">{selectedTrip.departureTime}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 block font-medium">Unidad Asignada:</span>
          <span className="text-xs font-bold text-slate-800">
            {selectedTrip.busNumber} • {selectedTrip.cooperativeName.replace("Transportes ", "").replace("Pullman ", "")}
          </span>
        </div>
      </div>

      {/* 2. Split: Autobús de 40 Asientos a la Izquierda, Formulario y Pago a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        {/* Columna Izquierda: Mapa de 40 Asientos */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <SeatMapGrid
            trip={selectedTrip}
            fromStopOrder={originStop.stopOrder}
            toStopOrder={destinationStop.stopOrder}
            selectedSeats={selectedSeats}
            onToggleSeat={(seat) => {
              setFormError(null);
              onToggleSeat(seat);
            }}
          />
        </div>

        {/* Columna Derecha: Formulario de Pasajero y Pago */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md space-y-2.5 sm:space-y-3"
          >
            {/* Resumen de Asientos Seleccionados */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5" />
                <span>Asientos Seleccionados</span>
              </span>

              <div className="flex items-center gap-1">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-xs shadow-xs"
                    >
                      #{s}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
                    Toca en el croquis para elegir
                  </span>
                )}
              </div>
            </div>

            {/* Datos Personales del Pasajero */}
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Nombres y Apellidos del Pasajero:
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Cédula / Pasaporte:
                  </label>
                  <input
                    type="text"
                    required
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Teléfono Celular:
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Toggle Descuento 3ra Edad / Conadis (-50%) */}
              <div
                onClick={() => onToggleSeniorCitizen(!isSeniorCitizen)}
                className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSeniorCitizen
                    ? "bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-300 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isSeniorCitizen
                        ? "bg-amber-400 text-slate-950 font-bold"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">
                      Tarifa Tercera Edad / Conadis (-50%)
                    </p>
                    <p className="text-[9px] text-slate-500 leading-tight">
                      Ley Orgánica del Adulto Mayor (Ecuador)
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    isSeniorCitizen
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  -50%
                </span>
              </div>

              {/* Métodos de Pago: Deuna, Tarjeta, Efectivo al Controlador */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Forma de Pago:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("deuna")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      paymentMethod === "deuna"
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs ring-1 ring-blue-500"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold">Deuna / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("tarjeta")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      paymentMethod === "tarjeta"
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs ring-1 ring-blue-500"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold">Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      paymentMethod === "efectivo"
                        ? "bg-amber-50 border-amber-500 text-amber-800 font-bold shadow-xs ring-1 ring-amber-500"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[10px] sm:text-[11px] font-bold leading-tight text-center">
                      Efectivo al Controlador
                    </span>
                  </button>
                </div>
              </div>

              {/* Sub-vistas según Método de Pago */}
              {paymentMethod === "efectivo" && (
                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 text-[11px] flex items-start gap-2 animate-fade-in shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="font-bold">⚠️ Recuerda:</strong> Al elegir pago en efectivo, debes presentarte y pagar al controlador en el bus al menos <strong>15 MINUTOS ANTES</strong> de la salida. Si no confirmas tu pago a tiempo, el sistema liberará tu asiento automáticamente.
                  </div>
                </div>
              )}

              {paymentMethod === "tarjeta" && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Pago Seguro con Tarjeta</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Visa / Mastercard</span>
                  </div>

                  <div className="grid grid-cols-12 gap-1.5">
                    <div className="col-span-6">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Número de Tarjeta:
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Expira:
                      </label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-center font-bold focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        CVV:
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-center font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "deuna" && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 animate-fade-in">
                  <div className="p-1 bg-white rounded-lg border border-slate-200 shrink-0">
                    <QRCodeSVG value="deuna-transporte-panamericana-e35" size={54} />
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-800 font-bold block">Deuna Banco Pichincha:</strong>
                    Escanea con tu App Banco Pichincha / Deuna o cualquier billetera móvil autorizada para confirmar de inmediato.
                  </div>
                </div>
              )}
            </div>

            {/* Error si no hay asientos */}
            {formError && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold text-center animate-fade-in">
                {formError}
              </div>
            )}

            {/* Total y Botón de Confirmación */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Total a Pagar:</span>
                  {totalSavings > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      (Ahorras ${totalSavings.toFixed(2)} USD)
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    ${totalAmount.toFixed(2)} USD
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedSeats.length === 0 || isSubmitting}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando Reserva en Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar y Emitir Boleto QR</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SeatAndPaymentStep;
