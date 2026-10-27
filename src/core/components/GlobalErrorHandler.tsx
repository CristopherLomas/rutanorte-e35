"use client";

import { useEffect } from "react";

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Evita que Next.js devtools muestre la pantalla roja cuando el error es un Event nativo de imagen/abort/video
      const r = event.reason;
      if (
        !r ||
        r instanceof Event ||
        (r && (r.name === "AbortError" || r.name === "NotAllowedError")) ||
        (typeof r === "object" && !("stack" in r) && !("message" in r))
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection, true);
    return () => window.removeEventListener("unhandledrejection", handleRejection, true);
  }, []);

  return null;
}

export default GlobalErrorHandler;
