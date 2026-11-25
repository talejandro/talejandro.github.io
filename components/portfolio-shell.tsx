"use client";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { preferences, T, usePreferences } from "./preferences";
import {
  basePath,
  isSection,
  sectionPath,
  sections,
  sectionSlugs,
} from "./routes";

function Filesystem({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { language, effects } = usePreferences();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    }

    function dismissWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    }

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissWithEscape);
    };
  }, [open]);

  return (
    <Collapsible
      ref={root}
      open={open}
      onOpenChange={setOpen}
      className="filesystem-menu"
    >
      <CollapsibleTrigger ref={trigger} className="filesystem-trigger">
        <span>Filesystem</span>
        <span className="menu-glyph" aria-hidden="true" />
      </CollapsibleTrigger>
      <CollapsiblePanel className="filesystem-reveal">
        <motion.div
          initial={effects && !reducedMotion ? { opacity: 0.35 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: effects && !reducedMotion ? 0.2 : 0 }}
          className="filesystem-panel"
        >
          <div className="filesystem-header">
            <h2>~/tomas-boquite</h2>
          </div>
          <nav
            aria-label={
              language === "es"
                ? "Secciones de Filesystem"
                : "Filesystem sections"
            }
          >
            <Link
              href="/"
              scroll={false}
              aria-current={pathname === "/" ? "page" : undefined}
              onNavigate={() => setOpen(false)}
            >
              <span aria-hidden="true">▤</span>
              <span>index.md</span>
            </Link>
            {sectionSlugs.map((slug) => {
              const href = sectionPath(slug);
              const { icon, files } = sections[slug];
              return (
                <Link
                  key={slug}
                  href={href}
                  scroll={false}
                  aria-current={pathname === href ? "page" : undefined}
                  onNavigate={() => setOpen(false)}
                >
                  <span aria-hidden="true">{icon}</span>
                  <span>{files[language === "es" ? 0 : 1]}</span>
                </Link>
              );
            })}
          </nav>
        </motion.div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

function SocialLinks() {
  return (
    <div className="social-links">
      <a href="mailto:tomas.boquite@gmail.com" aria-label="Email" title="Email">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="m3 6 9 7 9-7" />
        </svg>
      </a>
      <a
        href="https://github.com/talejandro"
        aria-label="GitHub"
        title="GitHub"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.7-.5-2.4 3.5-.4 6.5-1.8 6.5-6.1 0-1.5-.5-2.8-1.5-3.8.2-.4.7-1.8-.2-3.7 0 0-1.3-.4-4 1.5a14 14 0 0 0-7 0C5.1 1.6 3.8 2 3.8 2c-.9 1.9-.4 3.3-.2 3.7C2.5 6.7 2 8 2 9.5c0 4.3 3 5.7 6.5 6.1-.5.6-.7 1.3-.5 2.4v4" />
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/in/tom%C3%A1s-alejandro-boquite"
        aria-label="LinkedIn"
        title="LinkedIn"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4" />
        </svg>
      </a>
    </div>
  );
}

export function PortfolioShell({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [effects, setEffects] = useState(true);
  const reducedMotion = useReducedMotion();
  const nextPath = usePathname();
  const pathname = nextPath === "/" ? "/" : `${nextPath.replace(/\/$/, "")}/`;
  const router = useRouter();
  const main = useRef<HTMLElement>(null);
  const previous = useRef(pathname);

  useEffect(() => {
    document.documentElement.lang = language;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) {
      description.content =
        language === "es"
          ? "Tomás Boquite · Sysadmin & SRE. Experiencia en Linux, Windows, AWS, Azure, Kubernetes, CI/CD y observabilidad. Mendoza, Argentina."
          : "Tomás Boquite · Sysadmin & SRE. Experience with Linux, Windows, AWS, Azure, Kubernetes, CI/CD and observability. Mendoza, Argentina.";
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("crt-off", !effects);
  }, [effects]);

  useEffect(() => {
    if (pathname !== "/") return;

    function openLegacyLink() {
      const slug = window.location.hash.slice(1);
      if (isSection(slug)) router.replace(sectionPath(slug), { scroll: false });
    }

    openLegacyLink();
    window.addEventListener("hashchange", openLegacyLink);
    return () => window.removeEventListener("hashchange", openLegacyLink);
  }, [pathname, router]);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    main.current?.scrollTo({ top: 0 });
    main.current
      ?.querySelector<HTMLElement>("[data-view-heading]")
      ?.focus({ preventScroll: true });
  }, [pathname]);

  const animateView =
    effects && !reducedMotion && previous.current !== pathname;

  return (
    <preferences.Provider value={{ language, effects }}>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus({ preventScroll: true });
        }}
      >
        <T es="Saltar al contenido" en="Skip to content" />
      </a>
      <div className="workstation" id="inicio">
        <header className="topbar">
          <Link
            className="identity"
            href="/"
            scroll={false}
            aria-label={
              language === "es" ? "t4lejandro, inicio" : "t4lejandro, home"
            }
          >
            <img
              src={`${basePath}/assets/symbol.png`}
              alt=""
              width={38}
              height={38}
            />
            <span>t4lejandro</span>
          </Link>
          <div className="header-right">
            <button
              className="crt-toggle"
              type="button"
              aria-pressed={effects}
              aria-label={language === "es" ? "Efectos CRT" : "CRT effects"}
              onClick={() => setEffects(!effects)}
            >
              CRT
            </button>
            <SocialLinks />
            <div
              className="language-switch"
              role="group"
              aria-label={language === "es" ? "Idioma" : "Language"}
            >
              <button
                type="button"
                aria-label="Español"
                aria-pressed={language === "es"}
                onClick={() => setLanguage("es")}
              >
                ES
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                aria-label="English"
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>
        </header>
        <main ref={main} id="main" tabIndex={0}>
          <motion.div
            key={pathname}
            className={
              pathname === "/" ? "screen-view h-full" : "screen-view min-h-full"
            }
            initial={animateView ? { opacity: 0.45, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: effects && !reducedMotion ? 0.2 : 0 }}
          >
            {children}
            {pathname !== "/" && (
              <footer className="footer">
                <span>© {new Date().getFullYear()} Tomás Boquite</span>
                <span>
                  Mendoza, Argentina <span className="blue">/</span> UTC−3
                </span>
                <Link href="/" scroll={false}>
                  <T es="Volver al inicio" en="Back to home" />
                </Link>
              </footer>
            )}
          </motion.div>
        </main>
      </div>
      <Filesystem key={pathname} pathname={pathname} />
      <div className="crt-sweep" aria-hidden="true" />
      <div className="crt-startup" aria-hidden="true" />
      <div className="monitor-bezel" aria-hidden="true" />
    </preferences.Provider>
  );
}
