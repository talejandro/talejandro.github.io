export const sections = {
  "sobre-mi": {
    es: "Sobre mí",
    en: "About me",
    files: ["sobre-mi.md", "about.md"],
    icon: "▤",
  },
  experiencia: {
    es: "Experiencia",
    en: "Experience",
    files: ["experiencia/", "experience/"],
    icon: "▱",
  },
  proyectos: {
    es: "Proyectos",
    en: "Projects",
    files: ["proyectos/", "projects/"],
    icon: "▱",
  },
  stack: {
    es: "Stack técnico",
    en: "Tech stack",
    files: ["stack.yml", "stack.yml"],
    icon: "▤",
  },
  homelab: {
    es: "Homelab",
    en: "Homelab",
    files: ["homelab/", "homelab/"],
    icon: "▱",
  },
  articulos: {
    es: "Artículos",
    en: "Articles",
    files: ["articulos/", "articles/"],
    icon: "▱",
  },
  contacto: {
    es: "Contacto",
    en: "Contact",
    files: ["contacto.sh", "contact.sh"],
    icon: "@",
  },
} as const;

export type Section = keyof typeof sections;
export const sectionSlugs = Object.keys(sections) as Section[];
export const sectionPath = (slug: Section) => `/${slug}/`;
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function isSection(slug: string): slug is Section {
  return Object.hasOwn(sections, slug);
}
