# 🐜 La Hormiga Borracha

> Simulador de Movimiento Aleatorio (Random Walk) — Proyecto Universitario

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/hormiga-borracha)

---

## 📋 Descripción

**La Hormiga Borracha** es un simulador de movimiento aleatorio en el que una hormiga recorre una cuadrícula N×M moviéndose en direcciones aleatorias (Norte, Sur, Este, Oeste). El proyecto implementa los 4 casos de uso del enunciado universitario y está construido con **NestJS** (backend) + **Next.js** (frontend), desplegable en **Vercel**.

---

## 🎯 Casos de Uso Implementados

| CU | Descripción | Implementación |
|----|-------------|----------------|
| **CU-01** | Configurar escenario (cuadrícula N×M, posición inicial, máx. pasos) | `SetupForm.tsx` → `POST /api/simulation` |
| **CU-02** | Ejecutar movimiento aleatorio con slider de velocidad | `ControlPanel.tsx` + `useSimulation.ts` |
| **CU-03** | Visualizar trayectoria con mapa de calor | `GridCanvas.tsx` + `StepLogPanel.tsx` |
| **CU-04** | Finalizar simulación y mostrar resumen estadístico | `SummaryModal.tsx` → `GET /api/simulation/:id/summary` |

---

## 🏗️ Arquitectura del Proyecto

```
hormiga-borracha/                   ← Raíz del monorepo
├── vercel.json                     ← Configuración de despliegue Vercel
├── package.json                    ← Workspace root (npm workspaces)
├── .gitignore
│
├── apps/
│   │
│   ├── api/                        ← 🟢 Backend NestJS
│   │   ├── api/
│   │   │   └── index.ts            ← Adapter serverless para Vercel
│   │   ├── src/
│   │   │   ├── main.ts             ← Bootstrap (desarrollo local)
│   │   │   ├── app.module.ts       ← Módulo raíz
│   │   │   └── simulation/
│   │   │       ├── simulation.module.ts
│   │   │       ├── simulation.controller.ts   ← Endpoints REST
│   │   │       ├── simulation.service.ts      ← Lógica del simulador
│   │   │       ├── dto/
│   │   │       │   ├── create-simulation.dto.ts
│   │   │       │   └── step.dto.ts
│   │   │       └── entities/
│   │   │           └── simulation.entity.ts   ← Interfaces del dominio
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   └── package.json
│   │
│   └── web/                        ← 🔵 Frontend Next.js 14
│       ├── next.config.js
│       ├── tsconfig.json
│       ├── package.json
│       └── src/
│           ├── app/
│           │   ├── layout.tsx      ← Layout raíz + metadatos SEO
│           │   ├── page.tsx        ← Página principal (orquestador)
│           │   └── globals.css     ← Design system completo
│           ├── components/
│           │   ├── SetupForm.tsx   ← CU-01: Formulario de configuración
│           │   ├── GridCanvas.tsx  ← CU-03: Cuadrícula visual (mapa de calor)
│           │   ├── ControlPanel.tsx← CU-02: Controles + slider de velocidad
│           │   ├── StepLogPanel.tsx← CU-03: Log de movimientos
│           │   └── SummaryModal.tsx← CU-04: Resumen final
│           └── hooks/
│               └── useSimulation.ts← Motor de simulación + localStorage
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | NestJS | 10.x |
| Frontend | Next.js (App Router) | 14.x |
| Lenguaje | TypeScript | 5.x |
| Validación | class-validator | 0.14.x |
| Estilos | CSS puro (variables + animaciones) | — |
| Tipografías | Space Grotesk + JetBrains Mono | — |
| Deploy | Vercel (serverless) | — |

---

## 🚀 Instalación y Desarrollo Local

### Prerequisitos
- Node.js ≥ 18
- npm ≥ 9

### 1. Instalar dependencias

```bash
npm install
```

### 2. Levantar el frontend (Next.js)

```bash
npm run dev:web
# → http://localhost:3000
```

### 3. Levantar el backend (NestJS) — opcional

El frontend usa su propio motor de simulación en el cliente.  
Si quieres probar la API REST por separado:

```bash
npm run dev:api
# → http://localhost:3001/api
```

---

## 🌐 API REST (NestJS)

Base URL: `http://localhost:3001/api` (local) | `/api` (producción)

| Método | Endpoint | CU | Descripción |
|--------|----------|----|-------------|
| `POST` | `/simulation` | CU-01 | Crear nueva simulación |
| `POST` | `/simulation/:id/step?count=N` | CU-02 | Ejecutar N pasos |
| `GET` | `/simulation/:id` | CU-03 | Estado actual + mapa |
| `GET` | `/simulation/:id/summary` | CU-04 | Resumen estadístico final |
| `GET` | `/simulation` | — | Listar simulaciones |
| `DELETE` | `/simulation/:id` | — | Resetear simulación |

### Ejemplo: Crear simulación

```bash
curl -X POST http://localhost:3001/api/simulation \
  -H "Content-Type: application/json" \
  -d '{
    "rows": 10,
    "cols": 10,
    "startX": 5,
    "startY": 5,
    "maxSteps": 200
  }'
```

### Respuesta

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "grid": { "rows": 10, "cols": 10 },
  "position": { "x": 5, "y": 5 },
  "initialPosition": { "x": 5, "y": 5 },
  "maxSteps": 200,
  "stepsExecuted": 0,
  "failedAttempts": 0,
  "visitedCells": { "5,5": 1 },
  "log": [],
  "status": "running"
}
```

---

## 🎨 Características del Simulador

- **Mapa de calor**: Las celdas visitadas cambian de color según la frecuencia de visitas (verde → amarillo → rojo)
- **Slider de velocidad**: De ⚡ muy rápido (50ms/paso) a 🐢 muy lento (1500ms/paso)
- **Persistencia**: El estado se guarda en `localStorage` — si cierras el tab y vuelves, la simulación sigue donde quedó
- **Presets de cuadrícula**: Pequeño (8×8), Mediano (15×15), Grande (25×25)
- **Log de movimientos**: Historial en tiempo real con dirección, coordenadas y resultado
- **Borde inteligente**: Cuando la hormiga llega al límite, el intento se registra como fallido pero mantiene su posición

---

## ☁️ Despliegue en Vercel

### Opción A: CLI de Vercel

```bash
npm i -g vercel
vercel
```

### Opción B: Repositorio GitHub

1. Sube el proyecto a GitHub
2. Entra a [vercel.com](https://vercel.com) → **New Project**
3. Importa el repositorio
4. Vercel detecta automáticamente la configuración de `vercel.json`
5. Click en **Deploy** ✅

### Configuración de Build

El `vercel.json` en la raíz ya tiene todo configurado:
- **Build command**: `npm run build:web`
- **Output directory**: `apps/web/.next`
- **API**: `/api/*` → serverless function en `apps/api/api/index.ts`

---

## 📐 Modelo de Dominio

```
Simulation
├── id: string (UUID)
├── grid: { rows: N, cols: M }
├── position: { x, y }         ← posición actual
├── initialPosition: { x, y }  ← posición de inicio
├── maxSteps: number
├── stepsExecuted: number
├── failedAttempts: number      ← intentos en borde
├── visitedCells: Map<"x,y", count>  ← para mapa de calor
├── log: StepLog[]
└── status: "running" | "completed"

StepLog
├── step: number
├── direction: "NORTE" | "SUR" | "ESTE" | "OESTE"
├── from: { x, y }
├── to: { x, y }
├── success: boolean
└── reason?: string  ← "Límite alcanzado" si falló
```

---

## 👥 Equipo

Proyecto universitario — Simulación y Modelado

---

## 📄 Licencia

MIT
