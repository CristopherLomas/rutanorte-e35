import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de Solicitudes (Request): Inyecta token Bearer JWT si existe
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rutanorte_jwt");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas (Response): Manejo de 401 y expiración de sesión
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.warn("[AxiosClient] Sesión expirada o token no autorizado (401). Limpiando credenciales.");
        localStorage.removeItem("rutanorte_jwt");
        localStorage.removeItem("rutanorte_user");
        window.dispatchEvent(new CustomEvent("rutanorte_auth_expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
