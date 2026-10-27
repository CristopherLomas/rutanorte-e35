"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/core/components/Navbar";
import {
  MOCK_BUS_TRIPS,
  BusTrip,
  Stop,
} from "@/core/mocks/tulcanIbarraData";
import { useRouteStops } from "@/features/routes-map/hooks/useRouteStops";
import { useRouteCalculator } from "@/features/routes-map/hooks/useRouteCalculator";
import { WizardStepId } from "@/features/routes-map/components/WizardStepBar";
import { StopCardsGrid } from "@/features/routes-map/components/StopCardsGrid";
import { ScheduleSelectorStep } from "@/features/routes-map/components/ScheduleSelectorStep";
import { SeatAndPaymentStep } from "@/features/routes-map/components/SeatAndPaymentStep";
import { QrTicketStep } from "@/features/routes-map/components/QrTicketStep";
import { FloatingMapDrawer } from "@/features/routes-map/components/FloatingMapDrawer";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { UserSession } from "@/features/auth/types";
import { authService } from "@/features/auth/services/auth.service";
import { ControllerPanel } from "@/features/controller-panel/components/ControllerPanel";
import { AdminDashboard } from "@/features/admin-dashboard/components/AdminDashboard";
import { ArrowLeft } from "lucide-react";

export default function KioskPage() {
  // 1. Sesión de Usuario
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // 2. Paso del Wizard (1 al 5) y Dirección de Transición (1 adelante, -1 atrás)
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [stepDirection, setStepDirection] = useState<number>(1);

  // 3. Paradas del Corredor E35
  const { stops, originStop, destinationStop, setOriginOrder, setDestinationOrder, activeStop, setActiveStop } =
    useRouteStops();

  const [selectedOrigin, setSelectedOrigin] = useState<Stop | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Stop | null>(null);

  // 4. Horario y Asientos
  const [selectedTrip, setSelectedTrip] = useState<BusTrip>(MOCK_BUS_TRIPS[0]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(false);

  // 5. Datos del boleto emitido (Paso 5)
  const [issuedTicketData, setIssuedTicketData] = useState<{
    fullName: string;
    cedula: string;
    phone: string;
    paymentMethod: string;
    totalAmount: number;
  } | null>(null);

  // Reproducción segura y visible de video de fondo
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback seguro sin alertas
        });
      }
    }
  }, []);

  // Cargar sesión persistente al recargar la página
  React.useEffect(() => {
    const saved = authService.getStoredSession();
    if (saved) {
      setCurrentUser(saved);
      if (saved.isSenior) {
        setIsSeniorCitizen(true);
      }
    }

    const handleAuthExpired = () => {
      setCurrentUser(null);
    };
    window.addEventListener("rutanorte_auth_expired", handleAuthExpired);
    return () => {
      window.removeEventListener("rutanorte_auth_expired", handleAuthExpired);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // 6. Cálculo dinámico de ruta
  const activeOrigin = selectedOrigin || originStop;
  const activeDest = selectedDestination || destinationStop;
  const calculation = useRouteCalculator(activeOrigin, activeDest, isSeniorCitizen);

  // Variantes de animación horizontal fluida (Framer Motion)
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  // Selección de Origen (Paso 1 ➔ Paso 2) con feedback visual táctil
  const handleSelectOrigin = (stop: Stop) => {
    setSelectedOrigin(stop);
    setOriginOrder(stop.stopOrder);
    setActiveStop(stop);

    if (selectedDestination && selectedDestination.stopOrder <= stop.stopOrder) {
      setSelectedDestination(null);
    }

    setStepDirection(1);
    setTimeout(() => {
      setCurrentStep(2);
    }, 160);
  };

  // Selección de Destino (Paso 2 ➔ Paso 3) con feedback visual táctil
  const handleSelectDestination = (stop: Stop) => {
    setSelectedDestination(stop);
    setDestinationOrder(stop.stopOrder);
    setActiveStop(stop);
    setSelectedSeats([]);

    setStepDirection(1);
    setTimeout(() => {
      setCurrentStep(3);
    }, 160);
  };

  // Selección de Asientos
  const handleToggleSeat = (seatNumber: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  // Confirmar compra (Paso 4 ➔ Paso 5)
  const handleConfirmPurchase = (data: {
    fullName: string;
    cedula: string;
    phone: string;
    paymentMethod: string;
    totalAmount: number;
  }) => {
    setIssuedTicketData(data);
    setStepDirection(1);
    setCurrentStep(5);
  };

  // Reiniciar kiosco
  const handleRestartKiosk = () => {
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setSelectedSeats([]);
    setIssuedTicketData(null);
    setStepDirection(-1);
    setCurrentStep(1);
  };

  // Redirección condicional para perfiles operativos (Controlador)
  if (currentUser?.role === "controller") {
    return (
      <main className="h-screen max-h-screen w-screen overflow-hidden flex flex-col justify-between bg-slate-100 font-sans relative selection:bg-blue-600 selection:text-white">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-100 via-sky-50/40 to-slate-200 pointer-events-none" />
        <Navbar
          currentStep={currentStep}
          currentUser={currentUser}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />
        <div className="relative z-10 flex-1 overflow-hidden p-2 sm:p-3 max-w-7xl w-full mx-auto">
          <ControllerPanel />
        </div>
      </main>
    );
  }

  // Redirección condicional para perfiles operativos (Administrador)
  if (currentUser?.role === "admin") {
    return (
      <main className="h-screen max-h-screen w-screen overflow-hidden flex flex-col justify-between bg-slate-100 font-sans relative selection:bg-blue-600 selection:text-white">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-100 via-sky-50/40 to-slate-200 pointer-events-none" />
        <Navbar
          currentStep={currentStep}
          currentUser={currentUser}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />
        <div className="relative z-10 flex-1 overflow-hidden p-2 sm:p-3 max-w-7xl w-full mx-auto">
          <AdminDashboard />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen max-h-screen w-screen overflow-hidden flex flex-col justify-between p-0 m-0 bg-slate-100 font-sans relative selection:bg-blue-600 selection:text-white">
      {/* 0. Video de Paisajes Andinos en Bucle de Fondo (Visible en capa z-0) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter blur-[1px] opacity-45 mix-blend-multiply"
        >
          <source src="https://assets.mixkit.co/videos/41576/41576-720.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/31990/31990-720.mp4" type="video/mp4" />
        </video>
        {/* Capa de tinte suave para mantener contraste con las tarjetas */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-sky-50/30 to-slate-200/50" />
      </div>

      {/* Luz ambiental sutil difusa en la parte superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* 1. Barra de Navegación Sobria y Blanca */}
      <Navbar
        currentStep={currentStep}
        onStepClick={(step) => {
          setStepDirection(step > currentStep ? 1 : -1);
          if (step === 1) setCurrentStep(1);
          if (step === 2 && selectedOrigin) setCurrentStep(2);
          if (step === 3 && selectedOrigin && selectedDestination) setCurrentStep(3);
          if (step === 4 && selectedOrigin && selectedDestination) setCurrentStep(4);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        canNavigateToStep={(step) => {
          if (step === 1) return true;
          if (step === 2) return selectedOrigin !== null;
          if (step === 3) return selectedOrigin !== null && selectedDestination !== null;
          if (step === 4) return selectedOrigin !== null && selectedDestination !== null;
          return false;
        }}
      />

      {/* 2. Área Central Zero-Scroll (Encaja el 100% de la pantalla sin scroll vertical) */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-1 sm:py-2 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={stepDirection}>
          {/* PASO 1: SELECCIONA ORIGEN */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full space-y-3 sm:space-y-4 my-auto"
            >
              {/* Encabezado General Centrado */}
              <div className="text-center">
                <h1 className="font-extrabold text-2xl md:text-3xl text-slate-800 tracking-tight">
                  ¿Dónde empieza tu viaje?
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Selecciona tu terminal o parada en el Corredor Norte E35
                </p>
              </div>

              {/* Cuadrícula de Paradas Compacta y Equilibrada */}
              <StopCardsGrid
                stops={stops}
                selectedStop={selectedOrigin}
                onSelectStop={handleSelectOrigin}
              />
            </motion.div>
          )}

          {/* PASO 2: SELECCIONA DESTINO (REGLA RUTA SUR E35) */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full space-y-3 sm:space-y-4 my-auto"
            >
              {/* Encabezado Centrado con Botón Volver y Badge de Origen */}
              <div className="relative w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setStepDirection(-1);
                    setCurrentStep(1);
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white/90 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Volver al paso anterior</span>
                  <span className="sm:hidden">Volver</span>
                </button>

                <div className="text-center">
                  <h1 className="font-extrabold text-2xl md:text-3xl text-slate-800 tracking-tight">
                    ¿A dónde viajas?
                  </h1>
                  <div className="inline-flex items-center gap-2 mt-1 px-3 py-0.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs text-xs md:text-sm text-slate-600">
                    <span>
                      Saliendo desde: <strong className="text-blue-600 font-bold">{selectedOrigin?.name}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStepDirection(-1);
                        setCurrentStep(1);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer"
                    >
                      Cambiar origen
                    </button>
                  </div>
                </div>
              </div>

              {/* Cuadrícula de Paradas de Destino (Solo paradas hacia el sur habilitadas) */}
              <StopCardsGrid
                stops={stops}
                selectedStop={selectedDestination}
                onSelectStop={handleSelectDestination}
                disabledStopId={selectedOrigin?.id}
                minAllowedStopOrder={(selectedOrigin?.stopOrder ?? 1) + 1}
              />
            </motion.div>
          )}

          {/* PASO 3: HORARIOS (ZERO-SCROLL) */}
          {currentStep === 3 && selectedOrigin && selectedDestination && (
            <motion.div
              key="step-3"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full space-y-2 sm:space-y-3 my-auto"
            >
              {/* Encabezado con Botón Volver */}
              <div className="relative w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setStepDirection(-1);
                    setCurrentStep(2);
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white/90 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Volver al paso anterior</span>
                  <span className="sm:hidden">Volver</span>
                </button>

                <div className="text-center">
                  <h1 className="font-extrabold text-2xl md:text-3xl text-slate-800 tracking-tight">
                    Selecciona tu Horario
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Frecuencias directas en el Corredor Panamericana E35
                  </p>
                </div>
              </div>

              <ScheduleSelectorStep
                originStop={selectedOrigin}
                destinationStop={selectedDestination}
                calculation={calculation}
                selectedTrip={selectedTrip}
                onSelectTrip={(trip) => setSelectedTrip(trip)}
                onContinue={() => {
                  setStepDirection(1);
                  setCurrentStep(4);
                }}
                onBack={() => {
                  setStepDirection(-1);
                  setCurrentStep(2);
                }}
              />
            </motion.div>
          )}

          {/* PASO 4: ASIENTO & PAGO */}
          {currentStep === 4 && selectedOrigin && selectedDestination && (
            <motion.div
              key="step-4"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full my-auto"
            >
              <SeatAndPaymentStep
                originStop={selectedOrigin}
                destinationStop={selectedDestination}
                selectedTrip={selectedTrip}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                baseFarePerSeat={calculation.basePrice}
                isSeniorCitizen={isSeniorCitizen}
                onToggleSeniorCitizen={(val) => setIsSeniorCitizen(val)}
                onConfirmPurchase={handleConfirmPurchase}
                onBack={() => {
                  setStepDirection(-1);
                  setCurrentStep(3);
                }}
              />
            </motion.div>
          )}

          {/* PASO 5: BOLETO QR EMITIDO */}
          {currentStep === 5 && selectedOrigin && selectedDestination && issuedTicketData && (
            <motion.div
              key="step-5"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full my-auto"
            >
              <QrTicketStep
                originStop={selectedOrigin}
                destinationStop={selectedDestination}
                selectedTrip={selectedTrip}
                selectedSeats={selectedSeats}
                passengerData={issuedTicketData}
                isSeniorCitizen={isSeniorCitizen}
                onRestart={handleRestartKiosk}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Botón Flotante Moderno del Mapa (Esquina Inferior Derecha) */}
      <FloatingMapDrawer
        stops={stops}
        originStop={activeOrigin}
        destinationStop={activeDest}
        activeStop={activeStop}
        distanceKm={calculation.distanceKm}
        formattedDuration={calculation.formattedDuration}
        isSeniorDiscountApplied={isSeniorCitizen}
      />

      {/* Modal de Acceso / Login Operativo */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(session, isSenior) => {
          setCurrentUser(session);
          if (isSenior !== undefined) {
            setIsSeniorCitizen(isSenior);
          }
        }}
      />
    </main>
  );
}
