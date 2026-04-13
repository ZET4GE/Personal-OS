// Tipos globales del proyecto
// Cada dominio puede tener su propio archivo (user.ts, job.ts, project.ts...)

export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}
