"use client";

import React, { useState } from "react";
import {
  X,
  User,
  KeyRound,
  LogIn,
  UserPlus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import { UserRole, UserSession } from "../types";
import { authService } from "../services/auth.service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (session: UserSession, isSenior?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Campos Login
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Campos Registro
  const [regCedula, setRegCedula] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBirthDate, setRegBirthDate] = useState("1998-05-14");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Cálculo de edad para Tercera Edad (65+ años)
  const calculateAge = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    const birth = new Date(dateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(regBirthDate);
  const isSeniorEligible = currentAge >= 65;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const session = await authService.login(loginIdentifier, loginPassword);
      if (onLoginSuccess) {
        onLoginSuccess(session, session.isSenior);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al autenticar usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const session = await authService.register({
        cedula: regCedula,
        fullName: regName,
        email: regEmail,
        password: regPassword,
        birthDate: regBirthDate,
      });
      if (onLoginSuccess) {
        onLoginSuccess(session, session.isSenior);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-md p-6 border border-white/80 shadow-2xl text-slate-900 overflow-hidden">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-2 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Portal de Usuarios y Personal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Corredor Panamericana E35 • Tulcán - Ibarra
          </p>
        </div>

        {/* Banner de Error en Autenticación */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Pestañas Principales: Iniciar Sesión / Registrarse */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80 mb-4 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "login"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrarse</span>
          </button>
        </div>

        {/* Formulario 1: Iniciar Sesión */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-3 mb-5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Cédula o Correo Electrónico:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1002938471 o correo"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Contraseña:
              </label>
              <input
                type="password"
                required
                placeholder="••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>
        )}

        {/* Formulario 2: Registrarse (Con Detección Automática de Tercera Edad) */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-2.5 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                  Cédula:
                </label>
                <input
                  type="text"
                  required
                  value={regCedula}
                  onChange={(e) => setRegCedula(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                  Fecha de Nacimiento:
                </label>
                <input
                  type="date"
                  required
                  value={regBirthDate}
                  onChange={(e) => setRegBirthDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Insignia Dorada Si Tiene 65 Años o Más */}
            {isSeniorEligible && (
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-amber-900 animate-fade-in shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold">
                    Beneficio Tercera Edad ({currentAge} años detectados)
                  </span>
                </div>
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  50% Descuento Activo
                </span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                Nombre Completo:
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                  Contraseña:
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Completar Registro</span>
              )}
            </button>
          </form>
        )}

        {/* Pie de seguridad del modal */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Acceso seguro encriptado • Corredor Panamericana E35</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
