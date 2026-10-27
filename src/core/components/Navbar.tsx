"use client";

import React from "react";
import { Bus, Check, ChevronRight, User, LogOut } from "lucide-react";
import { UserSession } from "@/features/auth/types";
import { WizardStepId } from "@/features/routes-map/components/WizardStepBar";

interface NavbarProps {
  currentStep: WizardStepId;
  onStepClick?: (step: WizardStepId) => void;
  currentUser: UserSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  canNavigateToStep?: (step: WizardStepId) => boolean;
}

const STEPS = [
  { id: 1 as WizardStepId, title: "Origen" },
  { id: 2 as WizardStepId, title: "Destino" },
  { id: 3 as WizardStepId, title: "Horario" },
  { id: 4 as WizardStepId, title: "Asiento & Pago" },
  { id: 5 as WizardStepId, title: "Boleto QR" },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onStepClick,
  currentUser,
  onOpenLogin,
  onLogout,
  canNavigateToStep,
}) => {
  return (
    <header className="h-16 w-full px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-200/80 shadow-sm z-50 shrink-0 select-none">
      {/* 1. Logo Minimalista a la Izquierda */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
          <Bus className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900">
              Ruta Norte
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded border border-slate-200">
              E35
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
            Tulcán - Ibarra
          </p>
        </div>
      </div>

      {/* 2. Barra de Pasos Centrada (Estilo Kiosco / Aerolínea) */}
      <nav
        aria-label="Progreso del viaje"
        className="hidden md:flex items-center gap-1.5 lg:gap-2"
      >
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isClickable = canNavigateToStep ? canNavigateToStep(step.id) : isCompleted;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick && onStepClick(step.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : isCompleted
                    ? "text-blue-600 hover:bg-blue-50 cursor-pointer"
                    : "text-slate-600 cursor-not-allowed opacity-60"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? "bg-white text-blue-600"
                      : isCompleted
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                </span>
                <span className="whitespace-nowrap">{step.title}</span>
              </button>

              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* 3. Esquina Derecha: Botón de Perfil o Iniciar Sesión */}
      <div className="flex items-center space-x-2 shrink-0">
        {!currentUser ? (
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Iniciar Sesión</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <span className="font-semibold truncate max-w-[120px] sm:max-w-[160px]">
              {currentUser.name}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
