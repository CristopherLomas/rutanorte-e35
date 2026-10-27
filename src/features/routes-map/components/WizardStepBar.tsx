"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";

export type WizardStepId = 1 | 2 | 3 | 4 | 5;

interface WizardStepBarProps {
  currentStep: WizardStepId;
  onStepClick?: (step: WizardStepId) => void;
  isDarkMode: boolean;
}

interface StepItem {
  id: WizardStepId;
  title: string;
}

const STEPS: StepItem[] = [
  { id: 1, title: "Origen" },
  { id: 2, title: "Destino" },
  { id: 3, title: "Horario" },
  { id: 4, title: "Asiento & Pago" },
  { id: 5, title: "Boleto QR" },
];

export const WizardStepBar: React.FC<WizardStepBarProps> = ({
  currentStep,
  onStepClick,
  isDarkMode,
}) => {
  return (
    <nav
      aria-label="Progreso de compra"
      className={`w-full py-2.5 px-4 flex items-center justify-center border-b shrink-0 transition-colors duration-300 ${
        isDarkMode
          ? "bg-slate-900/60 border-white/5"
          : "bg-slate-50/90 border-slate-200/80"
      }`}
    >
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 max-w-4xl w-full justify-between sm:justify-center overflow-x-auto py-1">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-[1.02]"
                    : isCompleted
                    ? isDarkMode
                      ? "text-blue-400 hover:bg-white/5 cursor-pointer font-semibold"
                      : "text-blue-600 hover:bg-blue-50 cursor-pointer font-semibold"
                    : isDarkMode
                    ? "text-slate-500 cursor-not-allowed opacity-60"
                    : "text-slate-400 cursor-not-allowed opacity-60"
                }`}
              >
                {/* Indicador Circular */}
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    isActive
                      ? "bg-white text-blue-600"
                      : isCompleted
                      ? "bg-blue-500/20 text-blue-500 border border-blue-500/40"
                      : isDarkMode
                      ? "bg-slate-800 text-slate-500 border border-slate-700"
                      : "bg-slate-200 text-slate-500 border border-slate-300"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Texto del Paso */}
                <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap">
                  {step.title}
                </span>
              </button>

              {/* Separador entre pasos */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden sm:flex items-center text-xs font-bold ${
                    isCompleted
                      ? "text-blue-500/60"
                      : isDarkMode
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default WizardStepBar;
