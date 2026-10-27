"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Bus,
  Activity,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  CreditCard,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { TULCAN_IBARRA_STOPS, MOCK_BUS_TRIPS, BusTrip } from "@/core/mocks/tulcanIbarraData";

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"routes" | "fleet" | "metrics">("metrics");

  // Configuración de Tarifas
  const [farePerKm, setFarePerKm] = useState<number>(0.04);
  const [minimumFare, setMinimumFare] = useState<number>(0.75);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Flota y Turnos en Estado Local
  const [tripsList, setTripsList] = useState<BusTrip[]>(MOCK_BUS_TRIPS);
  const [newCoop, setNewCoop] = useState("Pullman Carchi");
  const [newDisco, setNewDisco] = useState("Disco 50 - Expreso Frontera");
  const [newTime, setNewTime] = useState("21:30");
  const [newDriver, setNewDriver] = useState("Luis Paspuel");

  const handleSaveFares = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveToast("✅ Tarifa regulada actualizada exitosamente en toda la plataforma E35.");
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const newTripItem: BusTrip = {
      id: `TRIP-NEW-${Date.now()}`,
      cooperativeName: newCoop,
      busNumber: newDisco,
      busType: "Ejecutivo Panamericano",
      departureTime: newTime,
      estimatedArrivalTime: "23:45",
      totalSeats: 40,
      driverName: newDriver,
      plate: "CBA-9921",
      amenities: ["WiFi 5G", "Climatizado", "USB"],
      bookedSegments: [],
    };
    setTripsList((prev) => [...prev, newTripItem]);
    setSaveToast(`✅ Nuevo turno (${newTime} - ${newDisco}) registrado con capacidad fija de 40 asientos.`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-slate-800 select-none overflow-hidden space-y-2">
      {/* 1. Header del Dashboard Administrativo */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Centro de Monitoreo y Regulación E35
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Puntualidad: 98.4%</span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight mt-0.5">
            Panel de Administración • Corredor Tulcán ➔ Ibarra
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{tripsList.length} Unidades Activas</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Monitoreo Homologado ANT</span>
          </div>
        </div>
      </div>

      {/* Alerta / Toast de Guardado */}
      {saveToast && (
        <div className="p-2 rounded-xl bg-slate-900 text-white text-xs font-semibold text-center animate-fade-in shadow-lg flex items-center justify-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Selector de Pestañas: Rutas / Flota / Métricas */}
      <div className="flex justify-center shrink-0">
        <div className="inline-flex p-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("routes")}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "routes"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>📍 Rutas y Paradas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "fleet"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>🚌 Flota y Turnos (40 Asientos)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "metrics"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>📊 Métricas y Finanzas</span>
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL ZERO-SCROLL */}
      <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden">
        {/* PESTAÑA A: RUTAS Y PARADAS */}
        {activeTab === "routes" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-stretch">
            {/* Tabla Compacta de las 8 Paradas */}
            <div className="md:col-span-8 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between overflow-hidden">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Corredor E35: 8 Paradas Reguladas (Tulcán ➔ Ibarra, 125 km)
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-2">#</th>
                        <th className="py-1.5 px-2">Parada / Ciudad</th>
                        <th className="py-1.5 px-2">Provincia</th>
                        <th className="py-1.5 px-2">Km E35</th>
                        <th className="py-1.5 px-2">Tarifa Base</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {TULCAN_IBARRA_STOPS.map((s) => {
                        const estimatedFare = Math.max(minimumFare, s.kmFromOrigin * farePerKm);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-1.5 px-2 font-mono font-bold text-blue-600">
                              0{s.stopOrder}
                            </td>
                            <td className="py-1.5 px-2 font-bold text-slate-900">
                              {s.name}
                            </td>
                            <td className="py-1.5 px-2 text-slate-500">{s.province}</td>
                            <td className="py-1.5 px-2 font-mono">{s.kmFromOrigin} km</td>
                            <td className="py-1.5 px-2 font-mono font-bold text-emerald-700">
                              ${estimatedFare.toFixed(2)} USD
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[10px] text-blue-900 font-medium flex items-center justify-between">
                <span>Longitud total del corredor: 125 km</span>
                <span className="font-bold">Regulación ANT Carchi - Imbabura</span>
              </div>
            </div>

            {/* Ajuste de Tarifas por Kilómetro */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between">
              <form onSubmit={handleSaveFares} className="space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Regulación de Tarifas por Km
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tarifa Base por Kilómetro (USD/km):
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    min="0.02"
                    max="0.10"
                    value={farePerKm}
                    onChange={(e) => setFarePerKm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Valor estándar nacional: $0.040 USD/km
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tarifa Mínima por Tramo Corto (USD):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.50"
                    max="2.00"
                    value={minimumFare}
                    onChange={(e) => setMinimumFare(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] leading-tight">
                  <strong>Ley Orgánica del Adulto Mayor:</strong> El descuento del 50% se calcula automáticamente sobre la tarifa base oficial.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Tarifa Regulada</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PESTAÑA B: FLOTA Y TURNOS (40 ASIENTOS) */}
        {activeTab === "fleet" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-stretch">
            {/* Lista de Unidades y Turnos */}
            <div className="md:col-span-8 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between overflow-hidden">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Unidades Asignadas (Capacidad Fija: 40 Asientos por Autobús)
                </span>
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-1.5 px-2">Hora Salida</th>
                        <th className="py-1.5 px-2">Unidad / Disco</th>
                        <th className="py-1.5 px-2">Cooperativa</th>
                        <th className="py-1.5 px-2">Conductor</th>
                        <th className="py-1.5 px-2">Capacidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {tripsList.map((trip) => (
                        <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-1.5 px-2 font-mono font-bold text-blue-600">
                            {trip.departureTime}
                          </td>
                          <td className="py-1.5 px-2 font-bold text-slate-900 truncate">
                            {trip.busNumber}
                          </td>
                          <td className="py-1.5 px-2 text-slate-600 truncate">
                            {trip.cooperativeName}
                          </td>
                          <td className="py-1.5 px-2 text-slate-500">{trip.driverName}</td>
                          <td className="py-1.5 px-2 font-mono font-bold text-emerald-700">
                            40 Asientos
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                <span>Total unidades registradas: {tripsList.length}</span>
                <span className="font-bold text-blue-600">3 Cooperativas del Corredor Norte</span>
              </div>
            </div>

            {/* Formulario Rápido de Registro de Turno */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between">
              <form onSubmit={handleAddTrip} className="space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Registrar Nuevo Turno en Ruta
                </span>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Cooperativa:
                  </label>
                  <select
                    value={newCoop}
                    onChange={(e) => setNewCoop(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="Pullman Carchi">Pullman Carchi</option>
                    <option value="Expreso Tulcán">Expreso Tulcán</option>
                    <option value="Transportes Unidos">Transportes Unidos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Disco / Unidad:
                  </label>
                  <input
                    type="text"
                    required
                    value={newDisco}
                    onChange={(e) => setNewDisco(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Hora Salida:
                    </label>
                    <input
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Capacidad:
                    </label>
                    <input
                      type="text"
                      disabled
                      value="40 Asientos"
                      className="w-full px-2 py-1 text-xs rounded-xl bg-slate-200 border border-slate-300 text-slate-600 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Conductor Asignado:
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Turno a la Flota</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PESTAÑA C: MÉTRICAS Y FINANZAS */}
        {activeTab === "metrics" && (
          <div className="flex flex-col justify-between h-full space-y-3">
            {/* 4 Tarjetas KPI Clave */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* KPI 1: Recaudado en Línea */}
              <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Recaudación en Línea
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono mt-0.5">
                    $3,485.50
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3 text-emerald-500" /> 68% pagos Deuna / Tarjeta
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 2: Cobrado en Efectivo por Controladores */}
              <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Cobrado en Efectivo
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-0.5">
                    $1,640.00
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                    <Banknote className="w-3 h-3 text-amber-600" /> 32% cobro a bordo
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 3: Boletos Tercera Edad */}
              <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Boletos Tercera Edad
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                    142 emitidos
                  </p>
                  <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1 mt-0.5">
                    <HeartHandshake className="w-3 h-3 text-amber-600" /> -$298.20 subsidiados
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 4: Asientos Liberados Regla 15 Minutos */}
              <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Asientos Liberados
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-0.5">
                    19 asientos
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <RotateCcw className="w-3 h-3 text-emerald-600" /> 100% reasignados en ruta
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Desglose por Cooperativa y Eficiencia */}
            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Desglose Financiero por Operador del Corredor E35
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">Pullman Carchi</p>
                    <p className="text-lg font-black text-blue-600 font-mono mt-0.5">$2,120.00</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">41.3% del volumen total</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">Expreso Tulcán</p>
                    <p className="text-lg font-black text-indigo-600 font-mono mt-0.5">$1,840.50</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">35.9% del volumen total</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">Transportes Unidos</p>
                    <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">$1,165.00</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">22.8% del volumen total</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total recaudado hoy en el corredor: <strong className="text-slate-900 font-bold">$5,125.50 USD</strong></span>
                <span className="font-semibold text-emerald-700">Auditado conforme a la Ley Orgánica de Transporte Terrestre</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
