import type { TechCatalogItem } from '@/types/tech-stack'

// ─────────────────────────────────────────────────────────────
// Catalog — ~90 techs ordenadas por popularidad dentro de cada categoría.
// icon.type:
//   'devicon'     → CDN: /devicons/devicon@v2.16.0/icons/{slug}/{slug}-{variant}.svg
//   'simpleicons' → CDN: https://cdn.simpleicons.org/{slug}
//   'none'        → fallback de iniciales coloreadas
// ─────────────────────────────────────────────────────────────

export const TECH_CATALOG: TechCatalogItem[] = [

  // ─── Lenguajes ────────────────────────────────────────────
  { name: 'Python',      slug: 'python',      category: 'language',  icon: { type: 'devicon', slug: 'python',     variant: 'original' } },
  { name: 'JavaScript',  slug: 'javascript',  category: 'language',  icon: { type: 'devicon', slug: 'javascript', variant: 'plain'    } },
  { name: 'TypeScript',  slug: 'typescript',  category: 'language',  icon: { type: 'devicon', slug: 'typescript', variant: 'plain'    } },
  { name: 'Go',          slug: 'go',          category: 'language',  icon: { type: 'devicon', slug: 'go',         variant: 'original' } },
  { name: 'PHP',         slug: 'php',         category: 'language',  icon: { type: 'devicon', slug: 'php',        variant: 'plain'    } },
  { name: 'Bash',        slug: 'bash',        category: 'language',  icon: { type: 'devicon', slug: 'bash',       variant: 'plain'    } },
  { name: 'PowerShell',  slug: 'powershell',  category: 'language',  icon: { type: 'devicon', slug: 'powershell', variant: 'plain'    } },
  { name: 'SQL',         slug: 'sql',         category: 'language',  icon: { type: 'none' } },
  { name: 'HTML',        slug: 'html5',       category: 'language',  icon: { type: 'devicon', slug: 'html5',      variant: 'original' } },
  { name: 'CSS',         slug: 'css3',        category: 'language',  icon: { type: 'devicon', slug: 'css3',       variant: 'original' } },

  // ─── Frameworks & Librerías ───────────────────────────────
  { name: 'React',       slug: 'react',       category: 'framework', icon: { type: 'devicon', slug: 'react',      variant: 'original' } },
  { name: 'Next.js',     slug: 'nextjs',      category: 'framework', icon: { type: 'devicon', slug: 'nextjs',     variant: 'original' } },
  { name: 'Vue',         slug: 'vuejs',       category: 'framework', icon: { type: 'devicon', slug: 'vuejs',      variant: 'original' } },
  { name: 'Nuxt',        slug: 'nuxtjs',      category: 'framework', icon: { type: 'devicon', slug: 'nuxtjs',     variant: 'original' } },
  { name: 'Astro',       slug: 'astro',       category: 'framework', icon: { type: 'devicon', slug: 'astro',      variant: 'plain'    } },
  { name: 'Node.js',     slug: 'nodejs',      category: 'framework', icon: { type: 'devicon', slug: 'nodejs',     variant: 'original' } },
  { name: 'Tailwind CSS',slug: 'tailwindcss', category: 'framework', icon: { type: 'devicon', slug: 'tailwindcss',variant: 'plain'    } },
  { name: 'FastAPI',     slug: 'fastapi',     category: 'framework', icon: { type: 'devicon', slug: 'fastapi',    variant: 'plain'    } },
  { name: 'Django',      slug: 'django',      category: 'framework', icon: { type: 'devicon', slug: 'django',     variant: 'plain'    } },

  // ─── Plataformas & Cloud ──────────────────────────────────
  { name: 'AWS',          slug: 'aws',          category: 'platform', icon: { type: 'devicon', slug: 'amazonwebservices', variant: 'original' } },
  { name: 'Azure',        slug: 'azure',        category: 'platform', icon: { type: 'devicon', slug: 'azure',     variant: 'original' } },
  { name: 'Google Cloud', slug: 'googlecloud',  category: 'platform', icon: { type: 'devicon', slug: 'googlecloud',variant: 'original'} },
  { name: 'Cloudflare',   slug: 'cloudflare',   category: 'platform', icon: { type: 'simpleicons', slug: 'cloudflare'   } },
  { name: 'Vercel',       slug: 'vercel',       category: 'platform', icon: { type: 'simpleicons', slug: 'vercel'        } },
  { name: 'Supabase',     slug: 'supabase',     category: 'platform', icon: { type: 'simpleicons', slug: 'supabase'      } },
  { name: 'DigitalOcean', slug: 'digitalocean', category: 'platform', icon: { type: 'simpleicons', slug: 'digitalocean'  } },
  { name: 'Netlify',      slug: 'netlify',      category: 'platform', icon: { type: 'simpleicons', slug: 'netlify'        } },
  { name: 'Hetzner',      slug: 'hetzner',      category: 'platform', icon: { type: 'simpleicons', slug: 'hetzner'        } },

  // ─── Bases de datos ───────────────────────────────────────
  { name: 'PostgreSQL',  slug: 'postgresql',  category: 'tool',      icon: { type: 'devicon', slug: 'postgresql', variant: 'original' } },
  { name: 'MySQL',       slug: 'mysql',       category: 'tool',      icon: { type: 'devicon', slug: 'mysql',      variant: 'original' } },
  { name: 'MongoDB',     slug: 'mongodb',     category: 'tool',      icon: { type: 'devicon', slug: 'mongodb',    variant: 'original' } },
  { name: 'Redis',       slug: 'redis',       category: 'tool',      icon: { type: 'devicon', slug: 'redis',      variant: 'original' } },
  { name: 'SQLite',      slug: 'sqlite',      category: 'tool',      icon: { type: 'devicon', slug: 'sqlite',     variant: 'plain'    } },

  // ─── Herramientas ─────────────────────────────────────────
  { name: 'Git',         slug: 'git',         category: 'tool',      icon: { type: 'devicon', slug: 'git',        variant: 'original' } },
  { name: 'GitHub',      slug: 'github',      category: 'tool',      icon: { type: 'devicon', slug: 'github',     variant: 'original' } },
  { name: 'GitLab',      slug: 'gitlab',      category: 'tool',      icon: { type: 'devicon', slug: 'gitlab',     variant: 'original' } },
  { name: 'Docker',      slug: 'docker',      category: 'tool',      icon: { type: 'devicon', slug: 'docker',     variant: 'original' } },
  { name: 'Kubernetes',  slug: 'kubernetes',  category: 'tool',      icon: { type: 'devicon', slug: 'kubernetes', variant: 'plain'    } },
  { name: 'Ansible',     slug: 'ansible',     category: 'tool',      icon: { type: 'devicon', slug: 'ansible',    variant: 'original' } },
  { name: 'Terraform',   slug: 'terraform',   category: 'tool',      icon: { type: 'devicon', slug: 'terraform',  variant: 'original' } },
  { name: 'Jenkins',     slug: 'jenkins',     category: 'tool',      icon: { type: 'devicon', slug: 'jenkins',    variant: 'original' } },
  { name: 'Nginx',       slug: 'nginx',       category: 'tool',      icon: { type: 'devicon', slug: 'nginx',      variant: 'original' } },
  { name: 'Grafana',     slug: 'grafana',     category: 'tool',      icon: { type: 'devicon', slug: 'grafana',    variant: 'original' } },
  { name: 'Prometheus',  slug: 'prometheus',  category: 'tool',      icon: { type: 'simpleicons', slug: 'prometheus'     } },
  { name: 'n8n',         slug: 'n8n',         category: 'tool',      icon: { type: 'simpleicons', slug: 'n8n'             } },
  { name: 'Figma',       slug: 'figma',       category: 'tool',      icon: { type: 'devicon', slug: 'figma',      variant: 'original' } },
  { name: 'Notion',      slug: 'notion',      category: 'tool',      icon: { type: 'simpleicons', slug: 'notion'           } },
  { name: 'Cursor',      slug: 'cursor',      category: 'tool',      icon: { type: 'none' } },

  // ─── Sistemas ─────────────────────────────────────────────
  { name: 'Linux',           slug: 'linux',           category: 'tool', icon: { type: 'devicon', slug: 'linux',   variant: 'original' } },
  { name: 'Ubuntu',          slug: 'ubuntu',          category: 'tool', icon: { type: 'devicon', slug: 'ubuntu',  variant: 'plain'    } },
  { name: 'Debian',          slug: 'debian',          category: 'tool', icon: { type: 'devicon', slug: 'debian',  variant: 'original' } },
  { name: 'Windows Server',  slug: 'windows-server',  category: 'tool', icon: { type: 'simpleicons', slug: 'windows'    } },
  { name: 'Active Directory',slug: 'active-directory',category: 'tool', icon: { type: 'simpleicons', slug: 'microsoftazure' } },

  // ─── Virtualización & Contenedores ───────────────────────
  { name: 'Proxmox',    slug: 'proxmox',    category: 'platform', icon: { type: 'simpleicons', slug: 'proxmox'  } },
  { name: 'VMware',     slug: 'vmware',     category: 'platform', icon: { type: 'simpleicons', slug: 'vmware'   } },
  { name: 'KVM',        slug: 'kvm',        category: 'platform', icon: { type: 'none' } },
  { name: 'Nutanix',    slug: 'nutanix',    category: 'platform', icon: { type: 'none' } },

  // ─── Monitoreo ────────────────────────────────────────────
  { name: 'Zabbix',    slug: 'zabbix',    category: 'tool', icon: { type: 'simpleicons', slug: 'zabbix'     } },
  { name: 'LibreNMS',  slug: 'librenms',  category: 'tool', icon: { type: 'none' } },
  { name: 'Cacti',     slug: 'cacti',     category: 'tool', icon: { type: 'none' } },
  { name: 'NetBox',    slug: 'netbox',    category: 'tool', icon: { type: 'simpleicons', slug: 'netbox'     } },
  { name: 'Wiki.js',   slug: 'wikijs',    category: 'tool', icon: { type: 'simpleicons', slug: 'wikidotjs'  } },

  // ─── Networking & Vendors ─────────────────────────────────
  { name: 'Cisco',     slug: 'cisco',     category: 'vendor', icon: { type: 'simpleicons', slug: 'cisco'    } },
  { name: 'Mikrotik',  slug: 'mikrotik',  category: 'vendor', icon: { type: 'none' } },
  { name: 'Huawei',    slug: 'huawei',    category: 'vendor', icon: { type: 'simpleicons', slug: 'huawei'   } },
  { name: 'Ubiquiti',  slug: 'ubiquiti',  category: 'vendor', icon: { type: 'simpleicons', slug: 'ubiquiti' } },
  { name: 'Cambium',   slug: 'cambium',   category: 'vendor', icon: { type: 'none' } },
  { name: 'HP',        slug: 'hp',        category: 'vendor', icon: { type: 'simpleicons', slug: 'hp'       } },
  { name: 'Juniper',   slug: 'juniper',   category: 'vendor', icon: { type: 'simpleicons', slug: 'junipernetworks' } },
  { name: 'Fortinet',  slug: 'fortinet',  category: 'vendor', icon: { type: 'simpleicons', slug: 'fortinet' } },

  // ─── IA & Productividad ───────────────────────────────────
  { name: 'Claude',    slug: 'claude',    category: 'tool', icon: { type: 'simpleicons', slug: 'anthropic'  } },
  { name: 'ChatGPT',   slug: 'chatgpt',   category: 'tool', icon: { type: 'simpleicons', slug: 'openai'     } },
]

// ─────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────

export const CATALOG_BY_SLUG = new Map(TECH_CATALOG.map((t) => [t.slug, t]))

export function searchCatalog(query: string, limit = 10): TechCatalogItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return TECH_CATALOG.slice(0, limit)
  return TECH_CATALOG.filter(
    (t) => t.name.toLowerCase().includes(q) || t.slug.includes(q),
  ).slice(0, limit)
}
