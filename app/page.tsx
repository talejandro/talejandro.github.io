import Link from "next/link";
import { T } from "../components/preferences";
import { basePath, sectionPath, sections } from "../components/routes";

const shortcuts = [
  {
    slug: "sobre-mi",
    path: "M5 28V12h4V8h4V5h6v3h4v4h4v16h-7v-8h-8v8ZM12 13h1v2h-1Zm7 0h1v2h-1Z",
  },
  {
    slug: "proyectos",
    path: "M6 3h15l5 5v21H6ZM20 3v7h6M12 15h-1v4H9v3h2v4h1m8-11h1v4h2v3h-2v4h-1",
  },
  { slug: "contacto", path: "M27 25H5V5h22v16H13V12h8v16M13 21h8" },
  {
    slug: "experiencia",
    path: "M4 10h24v18H4ZM11 10V5h10v5M4 17h24M14 16v5h4v-5",
  },
  {
    slug: "stack",
    path: "M5 3h22v26H5ZM5 12h22M5 21h22M9 7h2m5 0h7M9 16h2m5 0h7M9 25h2m5 0h7",
  },
  {
    slug: "homelab",
    path: "M5 27V14H2L16 3l14 11h-3v13ZM11 27V16h10v11M11 21h10M14 18h1m-1 6h1",
  },
] as const;

export default function Home() {
  return (
    <section className="hero" id="portada" aria-labelledby="hero-title">
      <h1 id="hero-title" tabIndex={-1} data-view-heading>
        Tomás Boquite
      </h1>
      <div className="ornament" aria-hidden="true">
        <span />
        <svg viewBox="0 0 20 20">
          <path d="m10 2 8 8-8 8-8-8Z" />
          <path d="m10 7 3 3-3 3-3-3Z" />
        </svg>
        <span />
      </div>
      <div className="welcome-row">
        <div className="profile-symbol">
          <img
            src={`${basePath}/assets/symbol.png`}
            alt=""
            width={80}
            height={80}
          />
        </div>
        <div className="welcome-dialog">
          <h2>
            Sysadmin &amp; SRE{" "}
            <span className="dialog-cursor" aria-hidden="true">
              ▸
            </span>
          </h2>
          <p>
            <T
              es="Infraestructura híbrida y automatización."
              en="Hybrid infrastructure and automation."
            />
          </p>
        </div>
        <div className="specialties">
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 18H3V9h4V5h10v4h4v9h-2ZM7 18h10" />
            </svg>
            <span>Cloud</span>
          </div>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 3h14v18H5ZM5 9h14M5 15h14M8 6h1m3 0h4M8 12h1m3 0h4M8 18h1m3 0h4" />
            </svg>
            <span>On-premise</span>
          </div>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 4h20v16H2Zm0 4h20M6 12l3 3-3 3m6 0h5" />
            </svg>
            <span>DevOps</span>
          </div>
        </div>
      </div>
      <div className="editor-status">
        <span>index.md</span>
        <span>1,1</span>
        <span>All</span>
      </div>
      <nav className="quick-access" aria-labelledby="quick-access-label">
        <span id="quick-access-label" className="sr-only">
          <T es="Accesos principales" en="Main navigation" />
        </span>
        {shortcuts.map(({ slug, path }) => (
          <Link key={slug} href={sectionPath(slug)} scroll={false}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d={path} />
            </svg>
            <span>
              <T es={sections[slug].es} en={sections[slug].en} />
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
