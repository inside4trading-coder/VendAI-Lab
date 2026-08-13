*[Versión en español](README.es.md)*

# VendAI Lab

Vending-machine management platform: commercial landing page + internal panel
to operate the fleet, customer CRM, and business finances.

**Production:** https://vend-ai-lab.vercel.app

---

## What it is

VendAI Lab has two clearly separated layers:

- **Public landing page** — presents the business model to potential
  customers and investors: how it works, who it's for, services, and an
  investor metrics section.
- **Internal panel (`/app`)** — the real operation: vending-machine
  management, locations, CRM, and finances, protected by authentication.

## What it does

### Landing page
- **3D Hero** — `NeuralField`: a field of nodes and connections in brand
  colors, with parallax and subtle cursor attraction; a lighter variant
  mounts on mobile (60 nodes vs. 110, DPR capped at [1, 1.5])
- **How it works / Who it's for / Model / Services** — sections explaining
  the business
- **Investors** — metrics with an animated counter (`AnimatedValue`,
  respects `prefers-reduced-motion`)
- **Contact**

### Internal panel (`/app`)
- **Dashboard** — operational overview (`useDashboardData.ts`)
- **Machines** — vending-machine inventory, with submodules:
  - `useMachines.ts` — machine listing and status
  - `useMachineProducts.ts` — products loaded per machine
  - `useMachineSales.ts` — sales per machine
  - `useMachineServices.ts` — services/maintenance
- **Locations** — management of the sites where machines are installed
- **Finance** — financial view of the business
- **CRM** — customer management (`components/app/crm/`)
- **Settings** — panel configuration (`components/app/settings/`)
- **Auth** — login with Supabase Auth (`useAuth.tsx`)

---

## Architecture

### Folder structure

```
src/
├── pages/
│   ├── Index.tsx           # Public landing page
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
│   │   ├── Hero.tsx / HeroBackground.tsx   # 3D Hero (NeuralField)
│   │   ├── ComoFunciona.tsx / ParaQuien.tsx / Modelo.tsx / Servicios.tsx
│   │   ├── Inversores.tsx / AnimatedValue.tsx
│   │   ├── Contacto.tsx
│   │   ├── Reveal.tsx / SectionHeader.tsx
│   │   └── three/                            # Hero 3D scene
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
└── migrations/                                 # 9 migrations (May 29, 2026)
```

---

## Tech stack

```
Frontend    React + TypeScript + Vite
3D          Three.js + @react-three/fiber + drei
Animation   Framer Motion
Backend/DB  Supabase (Postgres, Auth)
Deploy      Vercel
UI          shadcn/ui + Tailwind CSS
```

---

## Local development

```bash
npm install
npm run dev
```

## License

Private.