# Polla Mundialista — Sistema de Predicciones

Sistema web de predicciones para el Mundial de Fútbol. Permite a un grupo privado de usuarios registrar sus pronósticos partido a partido, calcular puntuaciones automáticamente y competir en un ranking global.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Configuración del backend](#configuración-del-backend)
- [Ejecución local](#ejecución-local)
- [Migraciones y base de datos](#migraciones-y-base-de-datos)
- [Endpoints disponibles](#endpoints-disponibles)
- [Roles y credenciales de prueba](#roles-y-credenciales-de-prueba)
- [Reglas de puntuación](#reglas-de-puntuación)
- [Seguridad aplicada](#seguridad-aplicada)
- [URL hosteada](#url-hosteada)

---

## Descripción general

La **Polla Mundialista** es una aplicación full-stack que cubre el flujo completo de una competencia de predicciones:

1. Los usuarios se registran e inician sesión con JWT.
2. Consultan los 12 partidos precargados de 2 grupos de la fase de grupos.
3. Registran su predicción de goles por partido (solo antes del resultado real).
4. El administrador carga el resultado real del partido.
5. El sistema calcula automáticamente los puntos de cada predicción.
6. El ranking global se actualiza en tiempo real.
7. Cualquier usuario autenticado puede consultar el historial de otro.

---

## Arquitectura

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para el diagrama completo de capas, flujo de datos y componentes.

**Resumen:**

```
[Angular 18 SPA]
       │  HTTP + JWT
       ▼
[.NET 8 Web API]
  ├── Controllers
  ├── Middlewares (GlobalException, RateLimiting)
  ├── Logic (Services)
  ├── Abstractions (Interfaces)
  ├── EntityFramework (DbContext, Repositories)
  └── PostgreSQL
```

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | C# / .NET 8 Web API |
| Frontend | Angular 18 |
| Base de datos | PostgreSQL |
| ORM | Entity Framework Core 8 |
| Autenticación | JWT Bearer (HS256) |
| Cifrado | AES-256-CBC (System.Security.Cryptography) |
| Hash contraseñas | HMACSHA512 |
| Rate Limiting | Ventana fija en memoria (custom middleware) |
| Documentación API | Swagger / OpenAPI 3 |

---

## Estructura del repositorio

```
/
├── src/
│   ├── Bizagi.Microservice.Api.WorldCupPool/                  # API Host
│   │   ├── Controllers/
│   │   ├── Middlewares/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── appsettings.Production.json
│   ├── Bizagi.Microservice.Api.WorldCupPool.Logic/            # Lógica de negocio
│   │   └── Services/
│   ├── Bizagi.Microservice.Api.WorldCupPool.Abstractions/     # Interfaces
│   │   ├── Repositories/
│   │   └── Services/
│   ├── Bizagi.Microservice.Api.WorldCupPool.EntityFramework/  # Persistencia
│   │   ├── Configurations/
│   │   ├── Repositories/
│   │   ├── Seeders/
│   │   ├── WorldCupPoolDbContext.cs
│   │   └── WorldCupPoolDbContextFactory.cs
│   ├── Bizagi.Microservice.Api.WorldCupPool.Entities/         # Entidades de dominio
│   └── Bizagi.Microservice.Api.WorldCupPool.Data.Transfer.Object/ # DTOs y Options
├── docs/
│   ├── ARCHITECTURE.md
│   └── DATABASE_SCHEMA.md
├── README.md
└── AI_LOG.md
```

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| .NET SDK | 8.0 |
| PostgreSQL | 14+ |
| Node.js | 20+ |
| Angular CLI | 18+ |
| Git | 2.x |

---

## Configuración del backend

### 1. Clonar el repositorio

```bash
git clone https://github.com/anfegave98/Bizagi.Microservice.Api.WorldCupPool
cd polla-mundialista
```

### 2. Configurar la cadena de conexión

Editar `src/Bizagi.Microservice.Api.WorldCupPool/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=WorldCupPool;Username=postgres;Password=<contraseña>"
  }
}
```

### 3. Configurar JWT

En `appsettings.Development.json`, ajustar la sección `Jwt`:

```json
{
  "Jwt": {
    "Issuer": "Bizagi.WorldCupPool",
    "Audience": "bizagi-worldcup-pool-site",
    "SecretKey": "clave-local-minimo-32-caracteres!!",
    "ExpirationMinutes": 480
  }
}
```

> **Producción:** inyectar `Jwt__SecretKey` como variable de entorno. Nunca versionar la clave real.

### 4. Configurar Encryption (opcional en desarrollo)

En desarrollo, el cifrado AES está deshabilitado por defecto (`Encryption:Enabled = false`). Para habilitarlo, generar una clave e IV válidos:

```csharp
// Ejecutar en una consola .NET o LINQPad
var key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)); // AES-256
var iv  = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16)); // 128-bit IV
Console.WriteLine($"Key: {key}");
Console.WriteLine($"IV:  {iv}");
```

Luego actualizar `appsettings.Development.json`:

```json
{
  "Encryption": {
    "Enabled": true,
    "Algorithm": "AES",
    "Key": "<base64-de-32-bytes>",
    "IV":  "<base64-de-16-bytes>"
  }
}
```

### 5. Variables de entorno (producción)

| Variable | Descripción |
|---|---|
| `ConnectionStrings__DefaultConnection` | Cadena de conexión PostgreSQL |
| `Jwt__SecretKey` | Clave secreta JWT |
| `Encryption__Key` | Clave AES en Base64 |
| `Encryption__IV` | IV AES en Base64 |

---

## Ejecución local

### Backend

```bash
# Restaurar dependencias
dotnet restore

# Aplicar migraciones y levantar la API
dotnet run --project src/Bizagi.Microservice.Api.WorldCupPool \
           --launch-profile Development
```

El seeder se ejecuta automáticamente al iniciar: crea roles, usuario administrador, 2 grupos, 8 equipos y 12 partidos.

Swagger disponible en: `http://localhost:<puerto>/index.html`

### Frontend

```bash
git clone https://github.com/anfegave98/bizagi-worldcup-pool-site
cd bizagi-worldcup-pool-site
npm install
ng serve
```

Aplicación disponible en: `http://localhost:4200`

---

## Migraciones y base de datos

```bash
# Crear migración inicial
dotnet ef migrations add InitialCreate \
  --project src/Bizagi.Microservice.Api.WorldCupPool.EntityFramework \
  --startup-project src/Bizagi.Microservice.Api.WorldCupPool

# Aplicar migración manualmente (el seeder la aplica automáticamente al iniciar)
dotnet ef database update \
  --project src/Bizagi.Microservice.Api.WorldCupPool.EntityFramework \
  --startup-project src/Bizagi.Microservice.Api.WorldCupPool
```

Ver esquema completo en [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md).

---

## Endpoints disponibles

| # | Verbo | Ruta | Descripción | Rol |
|---|---|---|---|---|
| 1 | POST | `api/v1/auth/register` | Registrar usuario | Público |
| 2 | POST | `api/v1/auth/login` | Login y JWT | Público |
| 3 | GET | `api/v1/matches` | Consultar partidos | User / Admin |
| 4 | POST | `api/v1/predictions` | Crear o actualizar predicción | User / Admin |
| 5 | GET | `api/v1/predictions/mine` | Mis predicciones | User / Admin |
| 6 | POST | `api/v1/admin/matches/{matchId}/result` | Registrar resultado real | Admin |
| 7 | GET | `api/v1/leaderboard` | Ranking global | User / Admin |
| 8 | GET | `api/v1/leaderboard/{userId}/history` | Historial de usuario | User / Admin |
| 9 | GET | `api/v1/admin/dashboard` | Dashboard administrativo | Admin |
| 10 | GET | `api/v1/health` | Health check | Público |

Swagger (solo en desarrollo): `http://localhost:<puerto>/index.html`

---

## Roles y credenciales de prueba

| Rol | Usuario | Contraseña | Correo |
|---|---|---|---|
| Admin | `admin` | `Admin@1234!` | `admin@worldcuppool.com` |
| User | `usuario1` | `User@1234!` | `usuario1@worldcuppool.com` |

> El usuario `admin` es creado automáticamente por el seeder al iniciar la aplicación.  
> El usuario `usuario1` debe ser creado mediante `POST api/v1/auth/register`.

### Flujo de prueba sugerido

1. `POST /api/v1/auth/login` con credenciales `admin` → obtener JWT.
2. `GET /api/v1/matches` → verificar los 12 partidos precargados.
3. `POST /api/v1/auth/register` → crear usuario participante.
4. Login con usuario participante → obtener JWT de usuario.
5. `POST /api/v1/predictions` → registrar predicciones para uno o varios partidos.
6. `GET /api/v1/predictions/mine` → verificar predicciones registradas.
7. Con JWT de admin: `POST /api/v1/admin/matches/{matchId}/result` → cargar resultado real.
8. `GET /api/v1/leaderboard` → verificar ranking actualizado.
9. `GET /api/v1/leaderboard/{userId}/history` → ver historial con puntos calculados.
10. `GET /api/v1/admin/dashboard` → verificar indicadores administrativos.

---

## Reglas de puntuación

| Situación | Puntos |
|---|---|
| Marcador exacto (local y visitante correctos) | 3 |
| Ganador correcto o empate acertado | 1 |
| Fallo (ninguna coincidencia) | 0 |

El cálculo se ejecuta automáticamente al registrar el resultado real. La trazabilidad queda en la tabla `ScoreLogs` con la regla aplicada (`ExactScore`, `WinnerOrDraw`, `Failed`).

---

## Seguridad aplicada

| Mecanismo | Detalle |
|---|---|
| Autenticación | JWT Bearer (HS256), configurable desde `appsettings.json` |
| Autorización | Roles `User` y `Admin` validados en backend |
| Hash contraseñas | HMACSHA512 con salt individual por usuario |
| Cifrado datos | AES-256-CBC con Key e IV desde configuración |
| Rate limiting | Ventana fija por usuario autenticado o IP; 5 políticas por tipo de endpoint |
| CORS | Orígenes restringidos desde `appsettings.json` |
| Manejo errores | Middleware global, sin exposición de stack trace |
| Swagger | Deshabilitado en producción (`Swagger:Enabled = false`) |

---

## URL hosteada

| Recurso | URL |
|---|---|
| API (backend) | `https://worldcuppool-api.onrender.com/api/v1` |
| Aplicación web (frontend) | `https://polla-mundialista.pages.dev` |
| Swagger API | `https://worldcuppool-api.onrender.com/index.html` (solo si habilitado) |

---

**Desarrollado por:** Andres Felipe Galeano Velasco  
**Sprint:** 04 – 08 de junio de 2026  
**Versión:** 1.0.0
