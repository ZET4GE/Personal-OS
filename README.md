# Personal OS

Workspace personal que combina un **dashboard privado** con un **perfil público**. Gestiona postulaciones laborales, proyectos y tu CV desde un solo lugar.

## Features

**Dashboard privado**
- Job tracking — registra postulaciones con estado, fecha y notas
- Projects — gestiona proyectos con stack tecnológico y visibilidad pública/privada
- CV — experiencia laboral, educación y skills con descarga a PDF
- Configuración de perfil público

**Perfil público** (`/[username]`)
- Portfolio con proyectos públicos
- CV online con descarga en PDF
- Metadata OpenGraph para cada página

## Tech Stack

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Validación | Zod 4 |
| Estado global | Zustand 5 |
| PDF | @react-pdf/renderer |
| Iconos | lucide-react |
| Deploy | Vercel |

## Setup local

### Prerequisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd personal-os
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con los valores de tu proyecto de Supabase (ver sección [Variables de entorno](#variables-de-entorno)).

### 3. Configurar Supabase

1. Crear un nuevo proyecto en [supabase.com/dashboard](https://supabase.com/dashboard)
2. Ir a **SQL Editor** y ejecutar las migraciones en orden:

```bash
# Ejecutar en el SQL Editor de Supabase:
supabase/migrations/001_jobs.sql
supabase/migrations/002_projects.sql
supabase/migrations/003_profiles.sql
supabase/migrations/004_cv.sql
```

3. En **Authentication → URL Configuration**, agregar:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública | Dashboard → Settings → API |

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/            # Login, signup
│   ├── (dashboard)/       # Rutas privadas (layout con sidebar)
│   │   ├── dashboard/     # Resumen
│   │   ├── jobs/          # Job tracking
│   │   ├── projects/      # Proyectos
│   │   ├── cv/            # Gestión del CV
│   │   └── settings/      # Perfil público
│   ├── [username]/        # Perfil público
│   │   ├── page.tsx       # Portfolio
│   │   ├── cv/            # CV público
│   │   └── projects/[id]/ # Detalle de proyecto
│   ├── api/
│   │   └── cv/[username]/pdf/  # Generación de PDF en servidor
│   └── auth/callback/     # OAuth callback
├── components/
│   ├── auth/              # AuthForm
│   ├── cv/                # Formularios + PDF renderer
│   ├── dashboard/         # DashboardShell, Sidebar, Topbar
│   ├── jobs/              # JobCard, JobForm, JobsClient
│   ├── projects/          # ProjectCard, ProjectForm, ProjectsClient
│   ├── public/            # Componentes del perfil público
│   ├── settings/          # ProfileSettingsForm
│   └── ui/                # Skeleton, etc.
├── lib/
│   ├── supabase/          # client.ts + server.ts
│   └── validations/       # Schemas de Zod
├── services/              # Funciones de acceso a datos
├── stores/                # Zustand (ui.store.ts)
└── types/                 # Tipos TypeScript
supabase/
└── migrations/            # SQL — ejecutar en orden (001→004)
```

## Deploy en Vercel

### Opción A — Importar repositorio (recomendado)

1. Conectar el repositorio en [vercel.com/new](https://vercel.com/new)
2. Vercel detecta Next.js automáticamente — no se necesita configuración extra
3. Agregar variables de entorno en **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. En Supabase → **Authentication → URL Configuration**, agregar la URL de producción:
   - Site URL: `https://tu-app.vercel.app`
   - Redirect URLs: `https://tu-app.vercel.app/auth/callback`

### Opción B — CLI

```bash
npm i -g vercel
vercel
```

## Scripts

```bash
npm run dev      # Desarrollo (http://localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción local
npm run lint     # Linting
```
