Proyecto: WINF (Work In One Framework)

Vision:
WINF es una plataforma personal guiada para cumplir metas. No debe sentirse como una coleccion de modulos sueltos. La experiencia principal se ordena alrededor de:

Meta activa -> Roadmap / camino -> Acciones de hoy -> Progreso real

Stack:
- Next.js App Router
- React
- Tailwind CSS
- Supabase Auth, Database y Storage
- Server Actions
- Vercel

Principio de producto:
- La meta activa es el centro.
- Roadmap es una herramienta para ejecutar metas, no el centro del producto.
- Los modulos se muestran u ocultan segun perfil y preferencias.
- No borrar features sin una migracion o decision explicita; primero ocultar y simplificar.

Perfiles:
- student
- freelancer
- employee
- builder
- personal

Modulos principales:
- Dashboard: foco diario, meta activa, acciones, acceso rapido y widgets secundarios.
- Goals: metas, progreso, hitos, tiempo invertido y entidades vinculadas.
- Roadmaps: camino visual para aprender o ejecutar una meta.
- Projects: proyectos personales o profesionales.
- Habits: seguimiento diario de habitos.
- Routines: bloques de rutina asociados o no a metas.
- Time: timer global y estadisticas de tiempo.
- Jobs: postulaciones, entrevistas y seguimiento laboral.
- Clients/Freelance: clientes, proyectos freelance y cobros.
- Finance: ingresos, gastos, presupuestos y balance personal.
- Notes: notas y conocimiento.
- CV: perfil profesional, experiencia, educacion, skills, cursos, proyectos y PDF.
- Blog: posts publicos o privados.
- Analytics: metricas del perfil publico.

Reglas de arquitectura:
- Cada usuario solo puede leer y modificar sus datos.
- Toda query sensible debe filtrar por user_id o depender de RLS validada.
- Las RPC security definer deben validar auth.uid().
- Evitar fuentes paralelas de verdad para progreso: goals.progress es el valor visible final; milestones, goal_links y time_entries alimentan el calculo.
- El dashboard no debe cargar todo por defecto. Cargar solo foco principal y widgets habilitados.
- ReactFlow y librerias pesadas deben cargarse solo donde se usan.

Estado actual:
- Dashboard guiado por meta activa.
- Onboarding con persona, modulos habilitados y primary_goal_id.
- Sidebar filtrado por enabled_modules.
- Guard de rutas opcionales por modulo.
- Timer flotante independiente del dashboard.
- Notificaciones y smart alerts integradas.
- Finanzas personales implementadas.
- CV mejorado con foto de perfil y PDF.
- Tags y busqueda global implementados.

Prioridades actuales:
1. Mantener foco de producto en meta activa.
2. Consolidar seguridad/RLS y RPC.
3. Simplificar roadmap en ejecutar/editar.
4. Reducir ruido visual del dashboard.
5. Optimizar queries y bundle.
6. Dejar monetizacion para etapa final.

Instrucciones para Codex:
- Lee este archivo antes de cambios grandes.
- Prioriza cambios pequeños, verificables y seguros.
- No reescribas modulos completos si un patch puntual resuelve el problema.
- No introducir complejidad visual ni tecnica innecesaria.
- Verificar con TypeScript, lint y build cuando sea posible.
