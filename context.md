Proyecto: WINF (Work In One Framework)

Descripción:
WINF es una plataforma web modular tipo SaaS enfocada en centralizar múltiples funcionalidades en un solo sistema.

El objetivo es ofrecer a usuarios y empresas una solución todo-en-uno para gestión, productividad y operación digital.

---

STACK TECNOLÓGICO:

Frontend:
- Next.js (App Router)
- React
- Tailwind CSS

Backend:
- Supabase (Auth + Database + Storage)
- Server Actions (Next.js)

Pagos:
- MercadoPago
- Transferencias manuales

Infraestructura:
- Vercel (deploy)
- Supabase Cloud

---

ARQUITECTURA:

El sistema está dividido en módulos dentro de /app:

- dashboard → panel principal del usuario
- auth → login, registro, recuperación de contraseña
- clients → gestión de clientes
- projects → gestión de proyectos
- jobs → tareas / trabajo
- notes → notas
- routines → hábitos / rutinas
- goals → objetivos
- analytics → métricas
- settings → configuración del usuario
- blog → contenido
- freelance → funcionalidades para servicios

Cada módulo es independiente pero comparte:
- autenticación
- base de datos
- UI components

---

AUTENTICACIÓN:

- Supabase Auth
- Login con email/password
- Recupero de contraseña vía email
- Futuro: integración API de correo personalizada

---

BASE DE DATOS:

- PostgreSQL (Supabase)
- Tablas principales:
  - users
  - profiles
  - projects
  - clients
  - tasks/jobs
  - payments
  - subscriptions

---

PAGOS:

- MercadoPago (principal)
- Transferencia bancaria (manual)
- Futuro:
  - suscripciones mensuales
  - planes FREE / PRO

---

OBJETIVO DEL PRODUCTO:

- No ser un "Tienda Nube"
- No usar templates genéricos
- Ofrecer soluciones personalizadas
- Escalar como SaaS en el futuro

---

REGLAS DE DESARROLLO:

- Mantener código simple
- No sobreingeniería
- Modularidad por features
- Reutilización de componentes
- Seguridad en auth y pagos

---

ESTADO ACTUAL:

- MVP funcional
- Ecommerce funcionando
- Pagos integrados (MercadoPago)
- Falta:
  - sistema de suscripciones
  - mejoras en email (API propia)
  - optimización UX/UI
  - escalabilidad

---

FUTURO:

- Multi-tenant (múltiples clientes)
- Sistema SaaS completo
- API pública
- Automatizaciones
- Integraciones externas

---

INSTRUCCIONES PARA CODEX:

- Asume siempre este contexto
- No pedir explicación del proyecto
- Respetar arquitectura modular
- No romper estructura existente
- Priorizar soluciones simples y escalables