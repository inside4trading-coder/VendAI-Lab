# VendAI Lab

Plataforma de gestión de máquinas vending: landing comercial + panel interno
para operar la flota, el CRM de clientes y las finanzas del negocio.

**Producción:** https://vend-ai-lab.vercel.app

---

## Qué es

VendAI Lab tiene dos capas claramente separadas:

- **Landing pública** — presentación del modelo de negocio, orientada a
  clientes potenciales e inversores: cómo funciona, para quién es, servicios,
  y sección de métricas para inversores.
- **Panel interno (`/app`)** — la operación real: gestión de máquinas
  vending, ubicaciones, CRM y finanzas, protegido con autenticación.

## Qué hace

### Landing
- **Hero 3D** — `NeuralField`: campo de nodos y conexiones en colores de
  marca, con parallax y atracción sutil al cursor; en móvil se monta una
  variante ligera (60 nodos vs 110, DPR limitado a [1, 1.5])
- **Cómo funciona / Para quién / Modelo / Servicios** — secciones
  explicativas del negocio
- **Inversores** — métricas con contador animado (`AnimatedValue`, respeta
  `prefers-reduced-motion`)
- **Contacto**

### Panel interno (`/app`)
- **Dashboard** — resumen operativo (`useDashboardData.ts`)
- **Máquinas** — inventario de máquinas vending, con submódulos:
  - `useMachines.ts` — listado y estado de máquinas
  - `useMachineProducts.ts` — productos cargados por máquina
  - `useMachineSales.ts` — ventas por máquina
  - `useMachineServices.ts` — servicios/mantenimiento
- **Ubicaciones** — gestión de los puntos donde están instaladas las máquinas
- **Finanzas** — vista financiera del negocio
- **CRM** — gestión de clientes (`components/app/crm/`)
- **Configuración** — ajustes del panel (`components/app/settings/`)
- **Auth** — login con Supabase Auth (`useAuth.tsx`)

---

## Arquitectura

### Estructura de carpetas

```
src/
├── pages/
│   ├── Index.tsx           # Landing pública
│   ├── Login.tsx
│   ├── _Placeholder.tsx
│   └── app/
│       ├── Dashboard.tsx
│       ├── Maquinas.tsx
│       ├── Ubicaciones.tsx
│       ├── Finanzas.tsx
│       └── Configuracion.tsx
├── components/
│   ├── landing/
│   │   ├── Hero.tsx / HeroBackground.tsx   # Hero 3D (NeuralField)
│   │   ├── ComoFunciona.tsx / ParaQuien.tsx / Modelo.tsx / Servicios.tsx
│   │   ├── Inversores.tsx / AnimatedValue.tsx
│   │   ├── Contacto.tsx
│   │   ├── Reveal.tsx / SectionHeader.tsx
│   │   └── three/                            # Escena 3D del hero
│   ├── app/
│   │   ├── crm/
│   │   ├── machines/
│   │   ├── settings/
│   │   ├── EmptyState.tsx
│   │   └── ThemeSync.tsx
│   ├── auth/
│   ├── brand/
│   ├── layout/
│   └── ui/                                    # shadcn primitives
├── hooks/
│   ├── crm/
│   ├── machines/                              # useMachines, useMachineProducts, useMachineSales, useMachineServices
│   ├── settings/
│   ├── useDashboardData.ts
│   ├── useAuth.tsx
│   └── useInView.ts
└── integrations/supabase/

supabase/
└── migrations/                                 # 9 migraciones (29 mayo 2026)
```

---

## Stack técnico

```
Frontend    React + TypeScript + Vite
3D          Three.js + @react-three/fiber + drei
Animación   Framer Motion
Backend/DB  Supabase (Postgres, Auth)
Deploy      Vercel
UI          shadcn/ui + Tailwind CSS
```

---

## Desarrollo local

```bash
npm install
npm run dev
```

## Licencia

Privado.
