import type { EnabledModule, UserOnboarding, UserPersona } from '@/types/onboarding'

export const ALWAYS_ENABLED_ROUTES = new Set(['/dashboard', '/goals', '/roadmaps', '/settings'])

export const MODULE_OPTIONS: { id: EnabledModule; label: string; description: string }[] = [
  { id: 'projects', label: 'Proyectos', description: 'Construir y seguir proyectos propios.' },
  { id: 'habits', label: 'Habitos', description: 'Seguimiento diario de actividades.' },
  { id: 'routines', label: 'Rutinas', description: 'Bloques repetibles de trabajo o vida.' },
  { id: 'jobs', label: 'Empleos', description: 'Postulaciones, entrevistas y ofertas.' },
  { id: 'clients', label: 'Clientes', description: 'Contactos y empresas.' },
  { id: 'freelance', label: 'Freelance', description: 'Proyectos pagos, cobros y entregas.' },
  { id: 'notes', label: 'Notas', description: 'Ideas, apuntes y documentación.' },
  { id: 'cv', label: 'CV', description: 'Experiencia, educación, skills y PDF.' },
  { id: 'blog', label: 'Blog', description: 'Publicaciones públicas o privadas.' },
  { id: 'analytics', label: 'Analytics', description: 'Visitas a perfil, CV y proyectos.' },
]

export const PERSONA_OPTIONS: {
  id: UserPersona
  title: string
  description: string
  goalPlaceholder: string
}[] = [
  {
    id: 'student',
    title: 'Estudiante',
    description: 'Aprendizaje, habitos de estudio, notas y roadmap.',
    goalPlaceholder: 'Ej: Terminar el curso de AWS',
  },
  {
    id: 'freelancer',
    title: 'Freelancer',
    description: 'Clientes, proyectos pagos, tiempo y cobros.',
    goalPlaceholder: 'Ej: Conseguir 3 clientes estables',
  },
  {
    id: 'employee',
    title: 'Empleado',
    description: 'Trabajo actual, carrera, rutinas y progreso profesional.',
    goalPlaceholder: 'Ej: Mejorar mi perfil para cambiar de rol',
  },
  {
    id: 'builder',
    title: 'Creador de proyectos',
    description: 'Ideas, proyectos, roadmaps y ejecución.',
    goalPlaceholder: 'Ej: Lanzar mi MVP en 30 dias',
  },
  {
    id: 'personal',
    title: 'Uso personal',
    description: 'Metas de vida, habitos, rutinas y seguimiento.',
    goalPlaceholder: 'Ej: Entrenar 4 veces por semana',
  },
]

export const MODULES_BY_PERSONA: Record<UserPersona, EnabledModule[]> = {
  student: ['projects', 'habits', 'routines', 'notes', 'cv'],
  freelancer: ['projects', 'habits', 'routines', 'clients', 'freelance', 'notes', 'cv', 'analytics'],
  employee: ['projects', 'habits', 'routines', 'jobs', 'notes', 'cv'],
  builder: ['projects', 'habits', 'routines', 'notes', 'blog', 'analytics'],
  personal: ['habits', 'routines', 'notes'],
}

export const ALL_MODULES = MODULE_OPTIONS.map((module) => module.id)

export function getPersonaDefaults(persona: UserPersona | null | undefined): EnabledModule[] {
  return persona ? MODULES_BY_PERSONA[persona] : ALL_MODULES
}

export function getEnabledModules(onboarding: UserOnboarding | null | undefined): EnabledModule[] {
  if (!onboarding) return ALL_MODULES
  if (onboarding.enabled_modules?.length) return onboarding.enabled_modules
  return getPersonaDefaults(onboarding.persona)
}
