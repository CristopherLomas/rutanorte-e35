"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, CreditCard, QrCode, CheckCircle2, Download, Printer } from "lucide-react";
import { BusTrip } from "@/core/mocks/tulcanIbarraData";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: BusTrip;
  originName: string;
  destinationName: string;
  selectedSeats: number[];
  totalAmount: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  trip,
  originName,
  destinationName,
  selectedSeats,
  totalAmount,
}) => {
  const [passenger, setPassenger] = useState({
    fullName: "",
    cedula: "",
    email: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"deuna" | "tarjeta" | "efectivo">("deuna");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>("");

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `RTN-${Date.now().toString().slice(-6)}`;
    setTicketId(generatedId);
    setIsCompleted(true);
  };

  const qrValue = JSON.stringify({
    ticketId: ticketId || "TEMP",
    coop: trip.cooperativeName,
    disco: trip.busNumber,
    from: originName,
    to: destinationName,
    seats: selectedSeats,
    cedula: passenger.cedula,
    amount: totalAmount,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Paso Final • Emisión de Boleto Digital
              </span>
              <h2 className="text-xl font-bold mt-1">Resumen y Pago Seguro</h2>
              <p className="text-xs text-slate-400">
                {trip.cooperativeName} ({trip.busNumber}) | {originName} ➔ {destinationName}
              </p>
            </div>

            {/* Asientos y total */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 mb-4 flex justify-between items-center text-xs">
              <div>
                <p className="text-slate-400">Asientos Reservados:</p>
                <div className="flex gap-1.5 mt-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Total a Pagar:</p>
                <span className="text-xl font-black text-emerald-400">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handlePay} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombres y Apellidos Completos:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Edwin Patricio Bolaños"
                  value={passenger.fullName}
                  onChange={(e) => setPassenger({ ...passenger, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-white/15 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cédula / Pasaporte:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0401234567"
                    value={passenger.cedula}
                    onChange={(e) => setPassenger({ ...passenger, cedula: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-white/15 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Celular (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0991234567"
                    value={passenger.phone}
                    onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-white/15 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Métodos de Pago */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Método de Pago Preferido:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("deuna")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "deuna"
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Deuna / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("tarjeta")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "tarjeta"
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "efectivo"
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <span>Efectivo/Boletería</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/30 hover:opacity-95 active:scale-[0.98] transition-all"
              >
                Pagar ${totalAmount.toFixed(2)} y Generar Boleto QR
              </button>
            </form>
          </div>
        ) : (
          /* Boleto emitido exitosamente con QR para el controlador */
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold">¡Boleto Emitido Exitosamente!</h2>
            <p className="text-xs text-slate-300 mt-1">
              Código de Verificación: <strong className="text-emerald-400 font-mono">{ticketId}</strong>
            </p>

            <div className="p-4 my-4 bg-white rounded-2xl shadow-xl flex flex-col items-center">
              <QRCodeSVG value={qrValue} size={150} level="H" />
              <p className="text-[10px] text-slate-600 mt-2 font-mono">
                Presenta este QR al subir al autobús
              </p>
            </div>

            <div className="w-full text-left p-3 bg-slate-900/80 rounded-xl border border-white/10 text-xs space-y-1 text-slate-300">
              <p><strong>Pasajero:</strong> {passenger.fullName} ({passenger.cedula})</p>
              <p><strong>Ruta:</strong> {originName} ➔ {destinationName}</p>
              <p><strong>Unidad:</strong> {trip.cooperativeName} ({trip.busNumber})</p>
              <p><strong>Asientos:</strong> {selectedSeats.join(", ")}</p>
              <p><strong>Total:</strong> ${totalAmount.toFixed(2)} USD</p>
            </div>

            <div className="flex gap-2 w-full mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
