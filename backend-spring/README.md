# Backend Spring Boot 3 - Sistema de Transporte Interparroquial E35 (Tulcán - Ibarra)

Backend RESTful empresarial desarrollado con **Java 17, Spring Boot 3.2.5, Spring Data JPA, Spring Security (JWT) y Redis**, conectado a **Supabase (PostgreSQL)** para la gestión y control de boletos en el Corredor Panamericana E35.

---

## 🏛️ Arquitectura del Sistema

### 1. Patrón "Package by Feature"
El proyecto organiza el código según los límites del dominio de negocio:
```
com.transporte.interparroquial
├── config/                  # Configuración de Redis y CORS
├── features/
│   ├── auth/                # Registro, Login, BCrypt y JWT con regla de 65+ años
│   ├── routes/              # Paradas reguladas E35 y cálculo tarifario ($0.04/km)
│   ├── booking/             # Bloqueo distribuido en Redis y emisión de boletos
│   └── boarding/            # Validación de código QR y Tarea Programada de 15 min
└── common/                  # Semillero de datos iniciales (DataInitializer)
```

### 2. Integración con Supabase (PostgreSQL)
- Conexión JDBC estándar con pool HikariCP optimizado y soporte SSL obligatorio (`sslmode=require`).
- Generación automática de índices en `email`, `cedula`, `qr_code_hash`, `schedule_id` y `stop_order`.
- Esquema DDL reproducible disponible en `src/main/resources/schema.sql`.

### 3. Control de Concurrencia con Redis
- **Bloqueo Distribuido por Tramos:** Cuando un pasajero selecciona un asiento, se genera una clave temporal en Redis:
  `lock:schedule:{id}:seat:{num}:tramo:{originOrder}-{destOrder}` con un **TTL de 5 minutos** (300 segundos).
- **Algoritmo de Reutilización de Asientos:** Un asiento está disponible si no colisiona con boletos activos (`PAID` o `PENDING_CASH`) ni bloqueos temporales en Redis según la regla de intervalos:
  $$\max(\text{origen}_{\text{nuevo}}, \text{origen}_{\text{existente}}) < \min(\text{destino}_{\text{nuevo}}, \text{destino}_{\text{existente}})$$

### 4. Tarea Programada (@Scheduled) - Regla de 15 Minutos
- Se ejecuta cada **60 segundos** (`@Scheduled(cron = "0 * * * * *")`).
- Identifica turnos que saldrán en los próximos 15 minutos: si existen boletos con estado `PENDING_CASH` (efectivo al controlador) no confirmados, cambia automáticamente su estado a `EXPIRED`, liberando los asientos de inmediato para su reventa en ruta.

---

## 🚀 Endpoints RESTful Disponibles

### Autenticación (`/api/v1/auth`)
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Registro con cálculo automático de 50% de descuento si tiene $\ge 65$ años. |
| `POST` | `/api/v1/auth/login` | Login con validación BCrypt y generación de token JWT. |

### Rutas y Tarifas (`/api/v1/routes`)
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/routes/stops` | Lista las 8 paradas oficiales ordenadas de Norte a Sur (Tulcán a Ibarra). |
| `GET` | `/api/v1/routes/calculate-fare` | Calcula distancia, duración y precio ($0.04/km, mín $0.75, -50% si aplica). |

### Reservas y Bloqueo Redis (`/api/v1/booking`)
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/booking/availability` | Estado de los 40 asientos en tiempo real para el tramo solicitado. |
| `POST` | `/api/v1/booking/lock-seat` | Bloqueo distribuido en Redis por 5 minutos mientras el cliente paga. |
| `POST` | `/api/v1/booking/confirm-purchase` | Emite el boleto (`PAID` o `PENDING_CASH`), genera QR y libera el bloqueo. |

### Abordaje y Control a Bordo (`/api/v1/boarding`)
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/boarding/scan-qr/{qrHash}` | Lector óptico QR: verifica si el boleto está pagado o requiere cobro en efectivo. |
| `POST` | `/api/v1/boarding/confirm-cash-and-board` | Registra cobro en efectivo y marca al pasajero como abordado. |
| `POST` | `/api/v1/boarding/confirm-boarding` | Marca abordaje para boletos pagados en línea. |
| `POST` | `/api/v1/boarding/cleanup-expired` | Disparador manual para cancelar boletos impagos expirados. |

---

## 🛠️ Ejecución Local

```bash
# Variables de entorno (opcionales si se usa Supabase y Redis Cloud)
export SPRING_DATASOURCE_URL="jdbc:postgresql://<SUPABASE_HOST>:6543/postgres?sslmode=require"
export SPRING_DATASOURCE_USERNAME="postgres.<PROJECT_REF>"
export SPRING_DATASOURCE_PASSWORD="<DB_PASSWORD>"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"

# Compilación y ejecución
mvn spring-boot:run
```
El servidor arrancará en el puerto **8080** con CORS habilitado para `http://localhost:3000`.
