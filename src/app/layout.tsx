import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GlobalErrorHandler } from "@/core/components/GlobalErrorHandler";

export const metadata: Metadata = {
  title: "Ruta Norte E35 | Corredor Interparroquial Tulcán - Ibarra",
  description:
    "Venta digital de boletos y asignación de asientos por tramos para el corredor Panamericano E35 (Tulcán - Ibarra)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-screen w-screen overflow-hidden bg-slate-50">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isSuppressed(e) {
                  if (!e) return true;
                  if (typeof Event !== 'undefined' && e instanceof Event) return true;
                  if (typeof e === 'object' && !('stack' in e) && !('message' in e)) return true;
                  if (e && (e.name === 'AbortError' || e.name === 'NotAllowedError')) return true;
                  return false;
                }
                window.addEventListener('unhandledrejection', function(event) {
                  if (isSuppressed(event.reason)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="h-screen w-screen overflow-hidden antialiased bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
}
