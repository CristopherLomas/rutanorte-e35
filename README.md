# 🚌 Ruta Norte E35 - Sistema Web de Venta de Boletos de Transporte Interparroquial

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&style=flat-square)](https://rutanorte-e35.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js&style=flat-square)](https://nextjs.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.2-green?logo=springboot&style=flat-square)](https://spring.io/projects/spring-boot)
[![PostgreSQL Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-blue?logo=supabase&style=flat-square)](https://supabase.com/)
[![Redis Cache](https://img.shields.io/badge/Cache-Redis_Distributed_Lock-red?logo=redis&style=flat-square)](https://redis.io/)

Plataforma web integral para la venta, reserva y control de boletos de transporte interparroquial en el corredor **Tulcán ➔ Ibarra (Panamericana E35, Ecuador)**, cumpliendo con la Ley Orgánica de Transporte Terrestre del Ecuador, control de concurrencia distribuida y diseño simétrico **Zero-Scroll** (`h-screen overflow-hidden`).

---

## 🌐 Enlaces Oficiales del Proyecto

* **Producción en Vivo (Vercel):** [https://rutanorte-e35.vercel.app](https://rutanorte-e35.vercel.app)
* **Repositorio en GitHub:** [https://github.com/CristopherLomas/rutanorte-e35](https://github.com/CristopherLomas/rutanorte-e35)

---

## 🔑 Credenciales Oficiales de Acceso

| Perfil / Rol | Identificador (Cédula o Correo) | Contraseña | Capacidades y Vistas |
| :--- | :--- | :--- | :--- |
| **Administrador** | `1002938471`<br>`admin.operaciones@rutanorte.ec` | `123456` | **Dashboard de Administración**: Métricas globales de flota, recaudación acumulada, tasa de ocupación y control de boletos. |
| **Controlador** | `0401827365`<br>`controlador.e35@pullmancarchi.ec` | `123456` | **Panel del Controlador**: Cámara de escaneo QR en vivo (30 FPS), croquis interactivo de 40 asientos y limpieza de impagos. |
| **Pasajero (3ra Edad)** | `0400192834`<br>`segundo.benavides@carchi.ec` | `123456` | **Beneficio Legal Activo**: Aplica automáticamente el **50% de descuento** en todos los tramos de la Panamericana E35. |
| **Pasajero Estándar** | `0401829341`<br>`carlos.villarreal@gmail.com` | `123456` | **Compra Estándar**: Reserva de asientos, pago en línea o efectivo al controlador y emisión de boleto QR. |

---

## 📍 Corredor Vial Tulcán - Ibarra (8 Paradas Oficiales)

El sistema opera exclusivamente bajo la **Regla de Ruta hacia el Sur** (`stopOrder > origin.stopOrder`):

1. **Tulcán** (Km 0.0 • Terminal Terrestre)
2. **Julio Andrade** (Km 21.5 • Parroquia Rural)
3. **Huaca** (Km 28.0 • Centro Cantonal)
4. **San Gabriel** (Km 42.0 • Pueblo Mágico del Ecuador)
5. **Bolívar** (Km 61.0 • Centro Cantonal)
6. **El Juncal / Chota** (Km 85.0 • Valle Cálido)
7. **Ambuquí** (Km 94.0 • Parroquia Frutícola)
8. **Ibarra** (Km 125.0 • Terminal Terrestre Ciudad Blanca)

---

## 🛠️ Stack Tecnológico

### Frontend (Next.js 15 + React 19)
* **Framework:** Next.js 15.5 con App Router y Server/Client Components.
* **Estilos & Animaciones:** Tailwind CSS 3.4 y Framer Motion 12 para transiciones horizontales suaves.
* **Lector Óptico en Vivo:** `jsQR` con Web Audio API para decodificación de fotogramas de cámara en tiempo real con pitido sonoro.
* **Cartografía Geográfica:** Leaflet 1.9 y React-Leaflet cargados dinámicamente (`ssr: false`) con OpenStreetMap y geometrías OSRM.
* **Generación de QR:** `qrcode.react` (formato SVG de alta definición).

### Backend (Spring Boot 3 + Java 17)
* **Arquitectura:** RESTful con patrón *Package by Feature* (`auth`, `booking`, `boarding`, `routes`).
* **Seguridad:** Spring Security con JWT (JSON Web Tokens) stateless y encriptación BCrypt.
* **Persistencia:** Spring Data JPA conectado a PostgreSQL en Supabase.
* **Concurrencia:** Bloqueo distribuido de asientos en Redis con TTL de 300 segundos (5 minutos).
* **Tarea Programada (`@Scheduled`):** Limpieza automática de reservas en efectivo impagas 15 minutos antes de la salida.

---

## 🚀 Arquitectura de Módulos

```
RUTANORTE/
├── src/
│   ├── app/                      # Next.js App Router (Layout, Page principal)
│   ├── core/                     # Módulos globales compartidos
│   │   ├── api/axiosClient.ts    # Cliente Axios con interceptor JWT
│   │   ├── components/Navbar.tsx # Barra de pasos y navegación de usuario
│   │   └── mocks/tulcanIbarraData.ts # Modelo de datos de paradas y flota
│   └── features/                 # Package by Feature
│       ├── admin-dashboard/      # Dashboard ejecutivo de administración
│       ├── auth/                 # Modal de login, registro y sesiones
│       ├── controller-panel/     # Cámara QR en vivo y croquis de 40 asientos
│       ├── routes-map/           # Wizard de 5 pasos, mapa Leaflet y boletos
│       └── seat-selection/       # Croquis de 40 asientos y bloqueo en Redis
├── backend-spring/               # Backend en Spring Boot 3 + Java 17
│   ├── src/main/java/.../        # Controladores, Entidades, Servicios y DTOs
│   ├── src/main/resources/       # application.yml y schema.sql
│   └── pom.xml                   # Dependencias Maven
├── public/images/stops/          # Fotografías locales reales del Carchi e Imbabura
├── vercel.json                   # Configuración para despliegue en Vercel
└── .env.example                  # Plantilla de variables de entorno
```

---

## 📋 Flujo del Sistema (5 Pasos Zero-Scroll)

1. **Paso 1: ¿Desde dónde viajas?** Selección simétrica de la parada de origen en tarjetas con fotos reales del Carchi e Imbabura.
2. **Paso 2: ¿A dónde viajas?** Filtrado estricto hacia el sur; paradas anteriores deshabilitadas automáticamente.
3. **Paso 3: Horario y Cooperativa:** Selección de turnos de transporte (Pullman Carchi, Expreso Tulcán, Transportes Unidos).
4. **Paso 4: Asiento & Pago:**
   * Mapa de 10 filas x 4 asientos (40 asientos compactos sin scroll interno).
   * Métodos: DeUna (QR), Tarjeta de Crédito/Débito, o **Efectivo al Controlador**.
   * **Regla de 15 Minutos:** Alerta clara de presentación previa al andén.
5. **Paso 5: Emisión de Boleto QR:** Tarjeta de embarque digital con código QR de alta resolución, botón de descarga PNG e impresión térmica.

---

## ⚡ Instalación y Ejecución Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/CristopherLomas/rutanorte-e35.git
cd rutanorte-e35
```

### 2. Frontend (Next.js)
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador: http://localhost:3000
```

### 3. Backend (Spring Boot)
```bash
cd backend-spring

# Compilar y empaquetar con Maven
mvn clean package -DskipTests

# Ejecutar el fat JAR
java -jar target/interparroquial-backend-1.0.0.jar
# Backend escuchando en: http://localhost:8080/api/v1
```

---

## 📜 Licencia & Derechos
Desarrollado para el Corredor de Transporte Interparroquial Tulcán - Ibarra (Panamericana E35). Todos los derechos reservados.
