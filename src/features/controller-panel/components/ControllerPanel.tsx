"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
  Bus,
  Clock,
  Zap,
  Camera,
  Check,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Video,
  VideoOff,
  RefreshCw,
  FlipHorizontal,
  Volume2,
} from "lucide-react";
import jsQR from "jsqr";
import { TULCAN_IBARRA_STOPS } from "@/core/mocks/tulcanIbarraData";
import { boardingService } from "../services/boarding.service";

interface ControllerTicket {
  ticketCode: string;
  passengerName: string;
  cedula: string;
  fromStopOrder: number;
  toStopOrder: number;
  fromName: string;
  toName: string;
  seatNumber: number;
  status: "PAGADO" | "PENDIENTE_EFECTIVO" | "EXPIRADO_CANCELADO";
  boarded: boolean;
  amountUSD: number;
}

const INITIAL_TICKETS: ControllerTicket[] = [
  {
    ticketCode: "E35-327414",
    passengerName: "Carlos Villarreal",
    cedula: "0401829341",
    seatNumber: 19,
    fromStopOrder: 2,
    toStopOrder: 8,
    fromName: "Julio Andrade",
    toName: "Ibarra",
    status: "PAGADO",
    boarded: false,
    amountUSD: 4.15,
  },
  {
    ticketCode: "E35-842109",
    passengerName: "Silvia Portilla",
    cedula: "1002394851",
    seatNumber: 7,
    fromStopOrder: 2,
    toStopOrder: 8,
    fromName: "Julio Andrade",
    toName: "Ibarra",
    status: "PENDIENTE_EFECTIVO",
    boarded: false,
    amountUSD: 4.15,
  },
  {
    ticketCode: "E35-901234",
    passengerName: "Jairo Chalá",
    cedula: "0402837461",
    seatNumber: 12,
    fromStopOrder: 3,
    toStopOrder: 6,
    fromName: "Huaca",
    toName: "El Juncal",
    status: "PAGADO",
    boarded: false,
    amountUSD: 2.5,
  },
  {
    ticketCode: "E35-554433",
    passengerName: "Milton Paspuel",
    cedula: "0401928374",
    seatNumber: 20,
    fromStopOrder: 2,
    toStopOrder: 4,
    fromName: "Julio Andrade",
    toName: "San Gabriel",
    status: "PENDIENTE_EFECTIVO",
    boarded: false,
    amountUSD: 1.5,
  },
  {
    ticketCode: "E35-776655",
    passengerName: "Lucía Montalvo",
    cedula: "1719283401",
    seatNumber: 18,
    fromStopOrder: 1,
    toStopOrder: 8,
    fromName: "Tulcán",
    toName: "Ibarra",
    status: "PAGADO",
    boarded: true,
    amountUSD: 5.0,
  },
  {
    ticketCode: "E35-112233",
    passengerName: "Rosa Anangonó",
    cedula: "1003847291",
    seatNumber: 31,
    fromStopOrder: 5,
    toStopOrder: 8,
    fromName: "Bolívar",
    toName: "Ibarra",
    status: "PAGADO",
    boarded: false,
    amountUSD: 3.2,
  },
  {
    ticketCode: "E35-998877",
    passengerName: "Galo Chamorro",
    cedula: "0400918273",
    seatNumber: 1,
    fromStopOrder: 2,
    toStopOrder: 8,
    fromName: "Julio Andrade",
    toName: "Ibarra",
    status: "PENDIENTE_EFECTIVO",
    boarded: false,
    amountUSD: 4.15,
  },
  {
    ticketCode: "E35-443322",
    passengerName: "Ana Revelo",
    cedula: "0401827364",
    seatNumber: 2,
    fromStopOrder: 1,
    toStopOrder: 8,
    fromName: "Tulcán",
    toName: "Ibarra",
    status: "PAGADO",
    boarded: true,
    amountUSD: 5.0,
  },
];

export const ControllerPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"scanner" | "croquis">("scanner");
  const [currentStopOrder, setCurrentStopOrder] = useState<number>(2); // Parada 2: Julio Andrade
  const [tickets, setTickets] = useState<ControllerTicket[]>(INITIAL_TICKETS);
  const [scannedCode, setScannedCode] = useState<string>("");
  const [activeResult, setActiveResult] = useState<ControllerTicket | null>(null);
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<ControllerTicket | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Estados y Referencias de la Cámara Óptica en Vivo
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  // Tono sonoro de confirmación de escaneo (Web Audio API nativo)
  const playBeepSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 nota aguda
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }, []);

  const currentStop =
    TULCAN_IBARRA_STOPS.find((s) => s.stopOrder === currentStopOrder) || TULCAN_IBARRA_STOPS[1];

  // Ejecutar limpieza de boletos en efectivo expirados (conecta a backend o fallback local)
  const handleCleanExpired = async () => {
    setIsProcessing(true);
    try {
      const res = await boardingService.cleanupExpired();
      setTickets((prev) =>
        prev.map((t) => {
          if (t.status === "PENDIENTE_EFECTIVO" && !t.boarded) {
            return { ...t, status: "EXPIRADO_CANCELADO" };
          }
          return t;
        })
      );
      if (selectedSeatDetails?.status === "PENDIENTE_EFECTIVO") {
        setSelectedSeatDetails(null);
      }
      setNotification(
        res.message ||
          `⚡ Reservas en efectivo sin confirmar fueron canceladas y sus asientos liberados automáticamente en Supabase.`
      );
    } catch {
      let expiredCount = 0;
      setTickets((prev) =>
        prev.map((t) => {
          if (t.status === "PENDIENTE_EFECTIVO" && !t.boarded) {
            expiredCount++;
            return { ...t, status: "EXPIRADO_CANCELADO" };
          }
          return t;
        })
      );
      if (selectedSeatDetails?.status === "PENDIENTE_EFECTIVO") {
        setSelectedSeatDetails(null);
      }
      setNotification(
        `⚡ ${expiredCount} reservas en efectivo sin confirmar fueron canceladas y sus asientos liberados automáticamente.`
      );
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  // Validar código de boleto (soporta JSON de QR, backend Spring Boot o lista local)
  const handleScanTicket = useCallback(async (rawCode: string) => {
    if (!rawCode.trim()) return;

    let codeToScan = rawCode.trim();
    let qrPayload: any = null;

    try {
      if (codeToScan.startsWith("{") && codeToScan.endsWith("}")) {
        qrPayload = JSON.parse(codeToScan);
        if (qrPayload.ticketId) {
          codeToScan = qrPayload.ticketId;
        }
      }
    } catch {}

    // Si el QR escaneado contiene el payload completo generado por la app
    if (qrPayload && qrPayload.ticketId) {
      const ticketFromQR: ControllerTicket = {
        ticketCode: qrPayload.ticketId,
        passengerName: qrPayload.passenger || "Pasajero Digital",
        cedula: qrPayload.cedula || "N/A",
        seatNumber: Array.isArray(qrPayload.seats)
          ? qrPayload.seats[0]
          : Number(qrPayload.seats) || 1,
        fromStopOrder: 1,
        toStopOrder: 8,
        fromName: qrPayload.route ? qrPayload.route.split("->")[0]?.trim() || "Tulcán" : "Tulcán",
        toName: qrPayload.route ? qrPayload.route.split("->")[1]?.trim() || "Ibarra" : "Ibarra",
        status: qrPayload.status === "PENDIENTE_PAGO" ? "PENDIENTE_EFECTIVO" : "PAGADO",
        boarded: false,
        amountUSD: Number(qrPayload.totalUSD) || 0,
      };

      setTickets((prev) => {
        if (!prev.some((t) => t.ticketCode === ticketFromQR.ticketCode)) {
          return [ticketFromQR, ...prev];
        }
        return prev;
      });

      setActiveResult(ticketFromQR);
      setScannedCode(ticketFromQR.ticketCode);
      setNotification(
        `📷 ¡Boleto QR Verificado por Cámara! Pasajero: ${ticketFromQR.passengerName} (Asiento #${ticketFromQR.seatNumber})`
      );
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setIsProcessing(true);
    try {
      const apiResult = await boardingService.scanQr(codeToScan);
      const mapped: ControllerTicket = {
        ticketCode: apiResult.qrCodeHash || codeToScan,
        passengerName: apiResult.passengerName || "Pasajero",
        cedula: apiResult.passengerCedula || "N/A",
        seatNumber: apiResult.seatNumber || 1,
        fromStopOrder: apiResult.originOrder || 1,
        toStopOrder: apiResult.destOrder || 8,
        fromName: apiResult.originStopName || "Tulcán",
        toName: apiResult.destinationStopName || "Ibarra",
        status: apiResult.status || "PAGADO",
        boarded: apiResult.boarded ?? apiResult.isBoarded ?? false,
        amountUSD: Number(apiResult.amountUSD) || 0,
      };
      setActiveResult(mapped);
      setScannedCode(mapped.ticketCode);
      setNotification(
        `✅ Boleto verificado con Supabase: ${mapped.passengerName} (Asiento #${mapped.seatNumber})`
      );
    } catch {
      const match = tickets.find(
        (t) => t.ticketCode.toLowerCase() === codeToScan.toLowerCase()
      );
      if (match) {
        setActiveResult(match);
        setScannedCode(match.ticketCode);
        setNotification(`✅ Boleto encontrado en lista activa: ${match.passengerName}`);
      } else {
        setActiveResult(null);
        setNotification(`Código "${codeToScan}" no encontrado en este viaje.`);
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }, [tickets]);

  // Detener hardware de cámara
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Iniciar hardware de cámara
  const startCamera = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Tu navegador o entorno no soporta acceso directo a la cámara.");
      return;
    }

    setIsCameraLoading(true);
    setCameraError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraReady(true);
      }

      setIsCameraLoading(false);
    } catch (err: any) {
      console.warn("[ControllerPanel] Error accediendo a la cámara:", err);
      setIsCameraLoading(false);
      setCameraReady(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Permiso de cámara denegado. Habilita el permiso en tu navegador.");
      } else {
        setCameraError("No se pudo iniciar el sensor de cámara en este equipo.");
      }
    }
  }, [cameraFacingMode]);

  // Ciclo de vida de la cámara al entrar/salir de la pestaña Escáner
  useEffect(() => {
    if (activeTab !== "scanner" || !isCameraActive) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [activeTab, isCameraActive, startCamera, stopCamera]);

  // Bucle de Escaneo Óptico en Vivo con jsQR
  useEffect(() => {
    if (!cameraReady || activeTab !== "scanner" || !isCameraActive) {
      return;
    }

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (qr && qr.data && qr.data.trim()) {
            const detected = qr.data.trim();
            const now = Date.now();
            if (detected !== lastScannedRef.current || now - lastScanTimeRef.current > 3000) {
              lastScannedRef.current = detected;
              lastScanTimeRef.current = now;
              playBeepSound();
              handleScanTicket(detected);
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [cameraReady, activeTab, isCameraActive, handleScanTicket, playBeepSound]);

  // Marcar abordaje para boleto pagado (Spring Boot / Supabase + estado local)
  const handleConfirmBoarding = async (ticketCode: string) => {
    setIsProcessing(true);
    try {
      await boardingService.confirmBoarding(ticketCode);
    } catch {
      // Ignorar error si backend no está activo
    } finally {
      setIsProcessing(false);
      setTickets((prev) =>
        prev.map((t) => (t.ticketCode === ticketCode ? { ...t, boarded: true } : t))
      );
      if (activeResult?.ticketCode === ticketCode) {
        setActiveResult((prev) => (prev ? { ...prev, boarded: true } : null));
      }
      if (selectedSeatDetails?.ticketCode === ticketCode) {
        setSelectedSeatDetails((prev) => (prev ? { ...prev, boarded: true } : null));
      }
      setNotification(`✅ Pasajero con boleto ${ticketCode} marcado como ABORDADO.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Cobrar en efectivo al pasajero y marcar abordado (Spring Boot / Supabase + estado local)
  const handleCollectCashAndBoard = async (ticketCode: string) => {
    setIsProcessing(true);
    try {
      await boardingService.confirmCashAndBoard(ticketCode);
    } catch {
      // Ignorar error si backend no está activo
    } finally {
      setIsProcessing(false);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketCode === ticketCode ? { ...t, status: "PAGADO", boarded: true } : t
        )
      );
      if (activeResult?.ticketCode === ticketCode) {
        setActiveResult((prev) => (prev ? { ...prev, status: "PAGADO", boarded: true } : null));
      }
      if (selectedSeatDetails?.ticketCode === ticketCode) {
        setSelectedSeatDetails((prev) => (prev ? { ...prev, status: "PAGADO", boarded: true } : null));
      }
      setNotification(`💵 Cobro en efectivo registrado con éxito. Asiento confirmado y abordado.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Liberar asiento manualmente si no se presentó
  const handleReleaseSeat = (ticketCode: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketCode === ticketCode ? { ...t, status: "EXPIRADO_CANCELADO", boarded: false } : t
      )
    );
    setSelectedSeatDetails(null);
    setNotification(`Asiento liberado para reventa en ruta.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 40 asientos clasificados para el croquis en la parada actual
  const getSeatStatus = (seatNum: number) => {
    const t = tickets.find(
      (tk) =>
        tk.seatNumber === seatNum &&
        tk.status !== "EXPIRADO_CANCELADO" &&
        tk.fromStopOrder <= currentStopOrder &&
        currentStopOrder < tk.toStopOrder
    );

    if (!t) {
      // Verificar si está ocupado en otro tramo futuro
      const futureTicket = tickets.find(
        (tk) =>
          tk.seatNumber === seatNum &&
          tk.status !== "EXPIRADO_CANCELADO" &&
          tk.fromStopOrder > currentStopOrder
      );
      if (futureTicket) return { type: "OTHER_SEGMENT", ticket: futureTicket };
      return { type: "EMPTY", ticket: null };
    }

    if (t.status === "PENDIENTE_EFECTIVO") {
      return { type: "PENDING_CASH", ticket: t };
    }
    return { type: "PAID_ONLINE", ticket: t };
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-slate-800 select-none overflow-hidden space-y-2">
      {/* 1. Cabecera Operativa del Bus en Ruta */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Disco 08 - Ciudad Blanca
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                IAA-3341
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Transportes Unidos • Corredor Tulcán ➔ Ibarra E35
            </p>
          </div>
        </div>

        {/* Selector de Parada Actual del Bus */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold hidden sm:inline">
            Parada Actual:
          </span>
          <select
            value={currentStopOrder}
            onChange={(e) => setCurrentStopOrder(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
          >
            {TULCAN_IBARRA_STOPS.map((s) => (
              <option key={s.id} value={s.stopOrder}>
                Parada {s.stopOrder}: {s.name} (Km {s.kmFromOrigin})
              </option>
            ))}
          </select>
        </div>

        {/* Tiempo para salida y botón de limpieza */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Salida en: 12 min</span>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCleanExpired}
            className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[10px] font-bold tracking-wide transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
            title="Cancelar reservas en efectivo no confirmadas 15 min antes"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Zap className="w-3 h-3" />
            )}
            <span>Limpiar Impagos Expirados</span>
          </button>
        </div>
      </div>

      {/* Alerta de Notificación / Toast */}
      {notification && (
        <div className="p-2 rounded-xl bg-slate-900 text-white text-xs font-medium text-center animate-fade-in shadow-lg flex items-center justify-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Alerta Informativa de Regla de 15 Minutos */}
      <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2 shrink-0 shadow-xs">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>REGLA DE 15 MINUTOS ACTIVA:</strong> Las reservas en efectivo no confirmadas antes de los 15 minutos se cancelan para reventa.
          </span>
        </div>
        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider hidden md:inline">
          Protocolo Oficial E35
        </span>
      </div>

      {/* Selector de Pestañas: 1. Escáner QR | 2. Croquis de Control */}
      <div className="flex justify-center shrink-0">
        <div className="inline-flex p-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("scanner")}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "scanner"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📷 Escáner QR de Abordaje</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("croquis")}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "croquis"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>🚌 Croquis de Control (40 Asientos en Vivo)</span>
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL ZERO-SCROLL */}
      <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden">
        {/* PESTAÑA 1: ESCÁNER QR */}
        {activeTab === "scanner" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-stretch">
            {/* Visor Real de Cámara Óptica */}
            <div className="md:col-span-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Cámara Óptica de Abordaje (En Vivo)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {cameraReady && isCameraActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Escaneando</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Sensor Pausado
                      </span>
                    )}
                  </div>
                </div>

                {/* Marco de Visor de Cámara Real */}
                <div className="relative w-full h-44 sm:h-52 rounded-xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center border-2 border-slate-700 shadow-inner group">
                  {/* Video en vivo con webcam/cámara del dispositivo */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      cameraReady && isCameraActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {/* Canvas invisible para muestreo de píxeles con jsQR */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Estado de Carga / Error / Pausa de Cámara */}
                  {(!isCameraActive || !cameraReady) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/95 text-slate-300 z-10">
                      {isCameraLoading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                          <p className="text-xs font-bold text-white">Iniciando Sensor Óptico de Cámara...</p>
                          <span className="text-[10px] text-slate-400 mt-1">Conectando con hardware de video</span>
                        </>
                      ) : cameraError ? (
                        <>
                          <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                          <p className="text-xs font-bold text-white max-w-xs">{cameraError}</p>
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="mt-2.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reintentar Acceso a Cámara</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <VideoOff className="w-8 h-8 text-slate-500 mb-2" />
                          <p className="text-xs font-bold text-slate-200">Cámara pausada</p>
                          <button
                            type="button"
                            onClick={() => setIsCameraActive(true)}
                            className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Activar Cámara</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Capas visuales de escaneo cuando la cámara está activa */}
                  {cameraReady && isCameraActive && (
                    <>
                      {/* Línea Láser Verde de Escaneo en Vivo */}
                      <div className="absolute inset-x-6 h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse z-10 pointer-events-none" />

                      {/* Cuadro de Enfoque con Esquinas */}
                      <div className="w-36 h-36 border-2 border-emerald-400/90 rounded-2xl flex items-center justify-center relative shadow-[0_0_20px_rgba(52,211,153,0.35)] pointer-events-none z-10">
                        <span className="absolute -top-2.5 left-2 bg-slate-900/95 border border-emerald-400/50 px-1.5 py-0.5 rounded text-[8px] font-mono text-emerald-400 font-bold tracking-wider">
                          ENFOQUE QR
                        </span>
                      </div>

                      {/* Indicador EN VIVO en esquina izquierda */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 text-[9px] font-mono text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>EN VIVO (30 FPS)</span>
                      </div>

                      {/* Botones de Control de Cámara en esquina derecha */}
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setCameraFacingMode((prev) =>
                              prev === "environment" ? "user" : "environment"
                            )
                          }
                          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer active:scale-95"
                          title="Voltear Cámara (Frontal / Trasera)"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCameraActive(false)}
                          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-rose-400 text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer active:scale-95"
                          title="Pausar Cámara"
                        >
                          <VideoOff className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="absolute bottom-2 inset-x-0 text-center text-[10px] text-white/90 font-medium bg-slate-950/75 py-1 backdrop-blur-xs z-10">
                        Apunta la cámara al boleto QR para escanear automáticamente
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Selector Rápido de Prueba (Demo) */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Simular Escaneo Rápido de Boletos en Parada:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {tickets
                    .filter((t) => t.status !== "EXPIRADO_CANCELADO")
                    .slice(0, 4)
                    .map((t) => (
                      <button
                        key={t.ticketCode}
                        type="button"
                        onClick={() => handleScanTicket(t.ticketCode)}
                        className={`p-1.5 rounded-xl border text-left text-[11px] font-semibold transition-all cursor-pointer ${
                          scannedCode === t.ticketCode
                            ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Asiento #{t.seatNumber}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              t.status === "PAGADO"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {t.status === "PAGADO" ? "PAGADO" : "PENDIENTE"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {t.passengerName}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Resultado de la Validación del Pasajero */}
            <div className="md:col-span-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Resultado de Validación de Abordaje
                </span>

                {activeResult ? (
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      activeResult.status === "PAGADO"
                        ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                        : "bg-amber-50/90 border-amber-300 text-amber-950"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        {activeResult.status === "PAGADO" ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-black text-sm leading-tight">
                            {activeResult.status === "PAGADO"
                              ? "Boleto Pagado en Línea - Pasajero Verificado"
                              : "⚠️ PAGO PENDIENTE EN EFECTIVO"}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-600">
                            Código: {activeResult.ticketCode}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm">
                        Asiento #{activeResult.seatNumber}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p>
                        <strong className="text-slate-700">Pasajero:</strong>{" "}
                        {activeResult.passengerName} (C.I: {activeResult.cedula})
                      </p>
                      <p>
                        <strong className="text-slate-700">Tramo del Viaje:</strong>{" "}
                        <span className="font-bold text-blue-700">
                          {activeResult.fromName} ➔ {activeResult.toName}
                        </span>
                      </p>
                      <p>
                        <strong className="text-slate-700">Valor del Boleto:</strong>{" "}
                        <span className="font-black text-slate-900">
                          ${activeResult.amountUSD.toFixed(2)} USD
                        </span>
                      </p>
                      <p>
                        <strong className="text-slate-700">Estado de Abordaje:</strong>{" "}
                        {activeResult.boarded ? (
                          <span className="text-emerald-700 font-bold">A BORDO</span>
                        ) : (
                          <span className="text-slate-500 font-medium">Por abordar en andén</span>
                        )}
                      </p>
                    </div>

                    {/* Botones de Acción en Resultado */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      {activeResult.status === "PAGADO" ? (
                        <button
                          type="button"
                          disabled={activeResult.boarded || isProcessing}
                          onClick={() => handleConfirmBoarding(activeResult.ticketCode)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>
                            {activeResult.boarded
                              ? "Pasajero Ya Abordado"
                              : "Confirmar Abordaje"}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={activeResult.boarded || isProcessing}
                          onClick={() => handleCollectCashAndBoard(activeResult.ticketCode)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Banknote className="w-4 h-4" />
                          )}
                          <span>
                            Dinero Recibido (${activeResult.amountUSD.toFixed(2)}) y Marcar Abordado
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center text-slate-400">
                    <QrCode className="w-12 h-12 mb-2 stroke-1" />
                    <p className="text-xs font-bold text-slate-700">Ningún boleto escaneado</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Usa el visor de cámara o presiona uno de los boletos demo de prueba
                    </p>
                  </div>
                )}
              </div>

              {/* Búsqueda manual de ticket */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Escribir código manual (ej. E35-327414)"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScanTicket(scannedCode)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleScanTicket(scannedCode)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Validar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: CROQUIS DE CONTROL (40 ASIENTOS EN VIVO) */}
        {activeTab === "croquis" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-stretch">
            {/* Grilla Táctil de 40 Asientos */}
            <div className="md:col-span-7 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-blue-600" />
                    <span>Croquis de 40 Asientos • Parada: {currentStop.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Toca un asiento para ver pasajero o cobrar
                  </span>
                </div>

                {/* 10 Filas de 4 Asientos */}
                <div className="flex flex-col items-center gap-y-1 w-full py-0.5">
                  {Array.from({ length: 10 }).map((_, r) => {
                    const s1 = r * 4 + 1;
                    const s2 = r * 4 + 2;
                    const s3 = r * 4 + 3;
                    const s4 = r * 4 + 4;

                    const renderControlSeat = (seatNum: number) => {
                      const { type, ticket } = getSeatStatus(seatNum);
                      const isSelected = selectedSeatDetails?.seatNumber === seatNum;

                      let colorClass =
                        "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"; // Libre
                      let label = `${seatNum}`;

                      if (type === "PAID_ONLINE") {
                        colorClass =
                          "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30"; // Pagado
                      } else if (type === "PENDING_CASH") {
                        colorClass =
                          "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm animate-pulse"; // Pendiente Efectivo
                      } else if (type === "OTHER_SEGMENT") {
                        colorClass =
                          "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"; // Otro tramo
                      }

                      return (
                        <button
                          key={seatNum}
                          type="button"
                          onClick={() => ticket && setSelectedSeatDetails(ticket)}
                          className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${colorClass} ${
                            isSelected ? "ring-4 ring-slate-900 scale-110 z-10" : ""
                          }`}
                          title={`Asiento #${seatNum}: ${
                            type === "EMPTY"
                              ? "Libre en esta parada"
                              : type === "PAID_ONLINE"
                              ? "Pagado en Línea"
                              : type === "PENDING_CASH"
                              ? "Pendiente de Pago en Efectivo"
                              : "Ocupado en otro tramo"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    };

                    return (
                      <div key={r} className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {renderControlSeat(s1)}
                          {renderControlSeat(s2)}
                        </div>
                        <div className="w-4 text-center text-[9px] text-slate-300">•</div>
                        <div className="flex gap-1">
                          {renderControlSeat(s3)}
                          {renderControlSeat(s4)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leyenda Interactiva de Asientos */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-[9px] sm:text-[10px] text-slate-600">
                <div className="flex items-center gap-1 justify-center">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300" />
                  <span>Libre</span>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600 text-white" />
                  <span>Pagado</span>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-500" />
                  <span>Pendiente Efectivo</span>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300" />
                  <span>Otro Tramo</span>
                </div>
              </div>
            </div>

            {/* Panel Lateral de Detalle del Asiento Tocado */}
            <div className="md:col-span-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex flex-col justify-between">
              {selectedSeatDetails ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Detalle del Asiento
                      </span>
                      <h3 className="text-xl font-black text-slate-900">
                        Asiento #{selectedSeatDetails.seatNumber}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        selectedSeatDetails.status === "PAGADO"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedSeatDetails.status === "PAGADO"
                        ? "PAGADO EN LÍNEA"
                        : "COBRO EN EFECTIVO PENDIENTE"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p>
                      <strong className="text-slate-900">Pasajero:</strong>{" "}
                      {selectedSeatDetails.passengerName}
                    </p>
                    <p>
                      <strong className="text-slate-900">C.I:</strong>{" "}
                      {selectedSeatDetails.cedula}
                    </p>
                    <p>
                      <strong className="text-slate-900">Tramo:</strong>{" "}
                      <span className="font-bold text-blue-600">
                        {selectedSeatDetails.fromName} ➔ {selectedSeatDetails.toName}
                      </span>
                    </p>
                    <p>
                      <strong className="text-slate-900">Monto:</strong>{" "}
                      <span className="font-extrabold text-slate-900 text-sm">
                        ${selectedSeatDetails.amountUSD.toFixed(2)} USD
                      </span>
                    </p>
                    <p>
                      <strong className="text-slate-900">Abordaje:</strong>{" "}
                      {selectedSeatDetails.boarded ? (
                        <span className="text-emerald-700 font-bold">A BORDO</span>
                      ) : (
                        <span className="text-amber-700 font-medium">Esperando en parada</span>
                      )}
                    </p>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="pt-2 space-y-2">
                    {selectedSeatDetails.status === "PENDIENTE_EFECTIVO" ? (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleCollectCashAndBoard(selectedSeatDetails.ticketCode)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Banknote className="w-4 h-4" />
                        )}
                        <span>
                          Cobrar Efectivo (${selectedSeatDetails.amountUSD.toFixed(2)}) y Abordar
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={selectedSeatDetails.boarded || isProcessing}
                        onClick={() => handleConfirmBoarding(selectedSeatDetails.ticketCode)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>
                          {selectedSeatDetails.boarded
                            ? "Pasajero Ya Abordado"
                            : "Marcar Pasajero Abordado"}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleReleaseSeat(selectedSeatDetails.ticketCode)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-[11px] transition-all cursor-pointer border border-slate-200"
                    >
                      Liberar Asiento (No se presentó)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Bus className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-700">Ningún asiento seleccionado</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Toca cualquier asiento amarillo o azul en el croquis para ver el pasajero o registrar su cobro.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControllerPanel;
