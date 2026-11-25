import { EditorPanel, EditorTabs } from "./editor-tabs";
import { T } from "./preferences";

export function About() {
  return (
    <section
      className="content-section"
      id="sobre-mi"
      aria-labelledby="about-title"
    >
      <div className="section-meta">
        <span>
          <T es={"~/sobre-mi.md"} en={"~/about.md"} />
        </span>
        <span>MARKDOWN</span>
      </div>
      <h2 id="about-title" tabIndex={-1} data-view-heading>
        <span className="heading-prefix">#</span>{" "}
        <span>
          <T es={"Sobre mí"} en={"About me"} />
        </span>
      </h2>
      <div className="editor-window">
        <div className="editor-profile">
          <div className="pixel-terminal" aria-hidden="true">
            <div className="pixel-screen">
              <span>&gt;_</span>
            </div>
            <div className="pixel-stand"></div>
            <div className="pixel-keyboard"></div>
          </div>
          <div className="editor-profile-name">Tomás Boquite</div>
          <div className="editor-profile-role">Sysadmin &amp; SRE</div>
        </div>
        <EditorTabs
          label={{ es: "Sobre mí", en: "About me" }}
          tabs={[
            { value: "presentation", es: "Presentación", en: "Overview" },
            { value: "services", es: "Servicios", en: "Services" },
            { value: "interests", es: "Intereses", en: "Interests" },
          ]}
        >
          <EditorPanel value="presentation">
            <h3 className="panel-title">
              <T es={"Presentación"} en={"Overview"} />
            </h3>
            <div className="about-grid">
              <div>
                <p className="lead">
                  <T
                    es={
                      "Trabajo en IT desde 2017. Como Sysadmin & SRE, administro infraestructura on-premise y cloud con foco en la confiabilidad de los servicios."
                    }
                    en={
                      "I've worked in IT since 2017. As a Sysadmin & SRE, I manage on-premises and cloud infrastructure with a focus on service reliability."
                    }
                  />
                </p>
                <p>
                  <T
                    es={
                      "Mi trabajo va desde operar servidores Linux y Windows hasta implementar pipelines de CI/CD, automatizar tareas operativas y desplegar monitoreo para detectar problemas a tiempo."
                    }
                    en={
                      "My work ranges from operating Linux and Windows servers to implementing CI/CD pipelines, automating operational tasks, and deploying monitoring for early issue detection."
                    }
                  />
                </p>
                <p>
                  <T
                    es={
                      "He administrado infraestructura tecnológica para empresas de transporte y logística, concesionarios automotrices, fintechs, desarrolladoras inmobiliarias, consultoras mineras y empresas públicas, entre otras."
                    }
                    en={
                      "I have managed IT infrastructure for transport and logistics companies, automotive dealerships, fintech firms, real estate developers, mining consultancies, and state-owned companies, among others."
                    }
                  />
                </p>
              </div>
              <dl className="profile-file">
                <div>
                  <dt>
                    <T es={"rol"} en={"role"} />
                  </dt>
                  <dd>Sysadmin & SRE</dd>
                </div>
                <div>
                  <dt>
                    <T es={"ubicación"} en={"location"} />
                  </dt>
                  <dd>Mendoza, Argentina</dd>
                </div>
                <div>
                  <dt>
                    <T es={"idiomas"} en={"languages"} />
                  </dt>
                  <dd>
                    <T
                      es={"Español · Inglés técnico"}
                      en={"Spanish · Technical English"}
                    />
                  </dd>
                </div>
                <div>
                  <dt>
                    <T es={"foco"} en={"focus"} />
                  </dt>
                  <dd>
                    <T
                      es={"Confiabilidad, automatización y cloud"}
                      en={"Reliability, automation, and cloud"}
                    />
                  </dd>
                </div>
              </dl>
            </div>
          </EditorPanel>
          <EditorPanel value="services">
            <div className="services-block">
              <h3>
                <T
                  es={"Consultoría IT & servicios"}
                  en={"IT consulting & services"}
                />
              </h3>
              <ul className="service-list">
                <li>
                  <T
                    es={"Administración de servidores"}
                    en={"Server administration"}
                  />
                </li>
                <li>
                  <T es={"Automatización & CI/CD"} en={"Automation & CI/CD"} />
                </li>
                <li>
                  <T
                    es={"Migraciones cloud & Microsoft 365"}
                    en={"Cloud & Microsoft 365 migrations"}
                  />
                </li>
                <li>
                  <T
                    es={"Observabilidad & monitoreo"}
                    en={"Observability & monitoring"}
                  />
                </li>
                <li>
                  <T
                    es={"Auditorías de infraestructura"}
                    en={"Infrastructure audits"}
                  />
                </li>
                <li>
                  <T
                    es={"Soporte L2 / L3 & redes"}
                    en={"L2 / L3 support & networking"}
                  />
                </li>
                <li>
                  <T
                    es={"Modernización tecnológica"}
                    en={"Technology modernization"}
                  />
                </li>
                <li>
                  <T
                    es={"Optimización de sistemas & costos"}
                    en={"System & cost optimization"}
                  />
                </li>
              </ul>
            </div>
          </EditorPanel>
          <EditorPanel value="interests">
            <h3 className="panel-title">
              <T es={"Intereses"} en={"Interests"} />
            </h3>
            <div className="interests">
              <span className="comment">
                <T
                  es={"# fuera de la terminal"}
                  en={"# outside the terminal"}
                />
              </span>
              <p>
                <T
                  es={"Videojuegos / Fotografía / Motociclismo / Otaku / Nerd"}
                  en={"Video games / Photography / Motorcycling / Otaku / Nerd"}
                />
              </p>
            </div>
          </EditorPanel>
        </EditorTabs>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section
      className="content-section"
      id="experiencia"
      aria-labelledby="experience-title"
    >
      <div className="section-meta">
        <span>
          <T es={"~/experiencia/"} en={"~/experience/"} />
        </span>
        <span>
          <T es={"TRAYECTORIA"} en={"CAREER"} />
        </span>
      </div>
      <h2 id="experience-title" tabIndex={-1} data-view-heading>
        <span className="heading-prefix">#</span>{" "}
        <span>
          <T es={"Experiencia"} en={"Experience"} />
        </span>
      </h2>
      <div className="editor-window editor-window-wide">
        <EditorTabs
          label={{ es: "Experiencia", en: "Experience" }}
          tabs={[
            { value: "career", es: "Trayectoria", en: "Career" },
            { value: "training", es: "Formación", en: "Education" },
          ]}
        >
          <EditorPanel value="career">
            <div className="timeline">
              <article className="job">
                <div className="job-date">
                  <T es={"ABR 2023 — ACTUALIDAD"} en={"APR 2023 — PRESENT"} />
                </div>
                <div>
                  <div className="job-title">
                    <h3>Sysadmin / SRE / CloudAdmin</h3>
                    <span className="tag">
                      <T es={"actual"} en={"current"} />
                    </span>
                  </div>
                  <p className="company">Silice</p>
                  <p>
                    <T
                      es={
                        "Administro servidores Linux y Windows, redes, entornos virtualizados y contenedores con Kubernetes. Trabajo con infraestructura on-premise y cloud e implemento CI/CD y automatizaciones para empresas de Argentina y del exterior."
                      }
                      en={
                        "I manage Linux and Windows servers, networks, virtualized environments, and containers with Kubernetes. I work with on-premises and cloud infrastructure and implement CI/CD and automation for companies in Argentina and abroad."
                      }
                    />
                  </p>
                  <div className="tags">
                    <span>AWS</span>
                    <span>Azure</span>
                    <span>Huawei Cloud</span>
                    <span>Kubernetes</span>
                    <span>CI/CD</span>
                  </div>
                </div>
              </article>
              <article className="job">
                <div className="job-date">
                  <T es={"MAR 2022 — ABR 2023"} en={"MAR 2022 — APR 2023"} />
                </div>
                <div>
                  <h3>
                    <T es={"Técnico de Sistemas"} en={"Systems Technician"} />
                  </h3>
                  <p className="company">Park Hyatt & Sun Plaza Mendoza</p>
                  <p>
                    <T
                      es={
                        "Administré servidores, Active Directory y copias de seguridad. Instalé y mantuve redes, equipos y cableado estructurado para la operación del hotel."
                      }
                      en={
                        "I managed servers, Active Directory, and backups. I installed and maintained networks, equipment, and structured cabling for hotel operations."
                      }
                    />
                  </p>
                </div>
              </article>
              <article className="job">
                <div className="job-date">
                  <T es={"SEP 2017 — ACTUALIDAD"} en={"SEP 2017 — PRESENT"} />
                </div>
                <div>
                  <h3>
                    <T
                      es={"Servicios IT · Freelance"}
                      en={"IT Services · Freelance"}
                    />
                  </h3>
                  <p>
                    <T
                      es={
                        "Realizo proyectos de virtualización y migración a la nube de sistemas on-premise. También brindo soporte técnico y hago mantenimiento y armado de equipos."
                      }
                      en={
                        "I work on virtualization projects and migrate on-premises systems to the cloud. I also provide technical support and maintain and build computers."
                      }
                    />
                  </p>
                </div>
              </article>
              <article className="job compact">
                <div className="job-date">
                  <T es={"MAY — SEP 2021"} en={"MAY — SEP 2021"} />
                </div>
                <div>
                  <h3>
                    <T es={"Técnico IT"} en={"IT Technician"} />
                  </h3>
                  <p className="company">
                    IUSP · Instituto Universitario de Seguridad Pública
                  </p>
                  <p>
                    <T
                      es={
                        "Administré servidores y brindé soporte IT. Impulsé la actualización de equipos y mejoras en la red LAN."
                      }
                      en={
                        "I managed servers and provided IT support. I helped move equipment upgrades and LAN improvements forward."
                      }
                    />
                  </p>
                </div>
              </article>
              <article className="job compact">
                <div className="job-date">2019 — 2020</div>
                <div>
                  <h3>
                    <T
                      es={"Asistente de Supervisión"}
                      en={"Supervision Assistant"}
                    />
                  </h3>
                  <p className="company">
                    <T
                      es={"Ministerio de Cultura y Turismo · Mendoza"}
                      en={"Ministry of Culture and Tourism · Mendoza"}
                    />
                  </p>
                  <p>
                    <T
                      es={
                        "Formé parte del equipo de producción de la Fiesta Nacional de la Vendimia. Asistí en la supervisión de TV, CCTV, pantallas LED, informática y software de control de acceso."
                      }
                      en={
                        "I worked on the production team for the Fiesta Nacional de la Vendimia. I assisted with supervision of TV, CCTV, LED screens, IT, and access control software."
                      }
                    />
                  </p>
                </div>
              </article>
            </div>
          </EditorPanel>
          <EditorPanel value="training">
            <div className="education">
              <h3>
                <span className="blue">+</span>{" "}
                <span>
                  <T
                    es={"Formación & capacitación"}
                    en={"Education & training"}
                  />
                </span>
              </h3>
              <div className="degree">
                <span className="comment">2019 — 2021</span>
                <h4>
                  <T
                    es={
                      "Técnico Universitario en Redes de Datos y Telecomunicaciones"
                    }
                    en={
                      "University Technician in Data Networks and Telecommunications"
                    }
                  />
                </h4>
                <p>ITU · Universidad Nacional de Cuyo</p>
              </div>
              <ul className="training">
                <li>
                  <span>AWS Academy · AWS Cloud Foundations</span>
                  <time>2024</time>
                </li>
                <li>
                  <span>FESAT · Python</span>
                  <time>2022</time>
                </li>
                <li>
                  <span>Google · IT Support Professional Certificate</span>
                  <time>2020</time>
                </li>
                <li>
                  <span>IBM · IT Fundamentals for Cybersecurity</span>
                  <time>2020</time>
                </li>
                <li>
                  <span>
                    <T
                      es={"Martín Zapata · Bachiller en Informática"}
                      en={"Martín Zapata · High school diploma in IT"}
                    />
                  </span>
                  <time>2014–2018</time>
                </li>
              </ul>
            </div>
          </EditorPanel>
        </EditorTabs>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section
      className="content-section"
      id="proyectos"
      aria-labelledby="projects-title"
    >
      <div className="section-meta">
        <span>
          <T es={"~/proyectos/"} en={"~/projects/"} />
        </span>
        <span>
          <T es={"INFRAESTRUCTURA / DEVOPS"} en={"INFRASTRUCTURE / DEVOPS"} />
        </span>
      </div>
      <h2 id="projects-title" tabIndex={-1} data-view-heading>
        <span className="heading-prefix">#</span>{" "}
        <span>
          <T es={"Proyectos"} en={"Projects"} />
        </span>
      </h2>
      <p className="section-intro">
        <T
          es={
            "Migraciones a la nube, automatización de entregas y mejoras de seguridad y monitoreo en entornos empresariales."
          }
          en={"Cloud migrations, delivery automation, and security and monitoring improvements in enterprise environments."}
        />
      </p>
      <div className="projects-grid">
        <article className="project">
          <div className="project-top">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18H5a4 4 0 0 1 0-8 7 7 0 0 1 13-2 5 5 0 0 1 1 10h-1M12 12v10m-4-6 4-4 4 4" />
            </svg>
            <span>CLOUD / MIGRATION</span>
          </div>
          <h3>
            <T
              es={"Migración de sistemas legados a la nube"}
              en={"Cloud migration for legacy systems"}
            />
          </h3>
          <p>
            <T
              es={
                "Participé en la modernización de infraestructura trasladando sistemas legados desde entornos on-premise a la nube."
              }
              en={
                "I helped modernize infrastructure by moving legacy systems from on-premises environments to the cloud."
              }
            />
          </p>
          <div className="tags">
            <span>Cloud</span>
            <span>
              <T es={"Modernización"} en={"Modernization"} />
            </span>
          </div>
        </article>
        <article className="project">
          <div className="project-top">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 8a5 5 0 1 0 0 8l8-8a5 5 0 1 1 0 8Z" />
            </svg>
            <span>DEVOPS / CI/CD</span>
          </div>
          <h3>
            <T
              es={"Pipelines de CI/CD para equipos de desarrollo"}
              en={"CI/CD pipelines for development teams"}
            />
          </h3>
          <p>
            <T
              es={
                "Implementé pipelines de CI/CD para que los equipos de desarrollo pudieran automatizar la integración y la entrega de software."
              }
              en={
                "I implemented CI/CD pipelines to help development teams automate software integration and delivery."
              }
            />
          </p>
          <div className="tags">
            <span>CI/CD</span>
            <span>
              <T es={"Automatización"} en={"Automation"} />
            </span>
          </div>
        </article>
        <article className="project">
          <div className="project-top">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6ZM8 12l3 3 5-6" />
            </svg>
            <span>INFRA / SECURITY</span>
          </div>
          <h3>
            <T
              es={"Hardening en transporte de pasajeros"}
              en={"Infrastructure hardening for passenger transport"}
            />
          </h3>
          <p>
            <T
              es={
                "Trabajé en la optimización y el refuerzo de la seguridad de la infraestructura de una empresa de transporte de pasajeros con operaciones en Argentina y en el exterior."
              }
              en={
                "I worked on infrastructure optimization and security hardening for a passenger transport company with operations in Argentina and abroad."
              }
            />
          </p>
          <div className="tags">
            <span>Hardening</span>
            <span>
              <T es={"Transporte"} en={"Transport"} />
            </span>
          </div>
        </article>
        <article className="project">
          <div className="project-top">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12h4l3-8 5 16 3-8h5" />
            </svg>
            <span>OBSERVABILITY</span>
          </div>
          <h3>
            <T es={"Monitoreo proactivo"} en={"Proactive monitoring"} />
          </h3>
          <p>
            <T
              es={
                "Implementé monitoreo de infraestructura en varias empresas argentinas para facilitar la detección temprana de problemas y la intervención antes de que escalen."
              }
              en={
                "I implemented infrastructure monitoring across several Argentine companies to help teams detect issues early and act before they escalate."
              }
            />
          </p>
          <div className="tags">
            <span>
              <T es={"Monitoreo"} en={"Monitoring"} />
            </span>
            <span>
              <T es={"Observabilidad"} en={"Observability"} />
            </span>
          </div>
        </article>
        <article className="project project-wide">
          <div className="project-top">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" />
              <path d="m3 6 9 7 9-7" />
            </svg>
            <span>CLOUD / PRODUCTIVITY</span>
          </div>
          <h3>
            <T
              es={"Migraciones a Microsoft 365"}
              en={"Microsoft 365 migrations"}
            />
          </h3>
          <p>
            <T
              es={"Participé en migraciones de entornos empresariales a Microsoft 365."}
              en={"I contributed to migrations of enterprise environments to Microsoft 365."}
            />
          </p>
        </article>
      </div>
    </section>
  );
}

export function TechStack() {
  return (
    <section
      className="content-section"
      id="stack"
      aria-labelledby="stack-title"
    >
      <div className="section-meta">
        <span>~/stack.yml</span>
        <span>YAML</span>
      </div>
      <h2 id="stack-title" tabIndex={-1} data-view-heading>
        <span className="heading-prefix">#</span>{" "}
        <span>
          <T es={"Stack técnico"} en={"Technical stack"} />
        </span>
      </h2>
      <div className="stack-window">
        <div className="window-bar">
          <span>stack.yml</span>
          <span aria-hidden="true">─ □ ×</span>
        </div>
        <dl className="stack-list">
          <div>
            <dt>systems:</dt>
            <dd>
              Linux <span aria-hidden="true">/</span> Windows{" "}
              <span aria-hidden="true">/</span> Active Directory{" "}
              <span aria-hidden="true">/</span> LDAP
            </dd>
          </div>
          <div>
            <dt>cloud:</dt>
            <dd>
              AWS <span aria-hidden="true">/</span> Azure{" "}
              <span aria-hidden="true">/</span> Huawei Cloud
            </dd>
          </div>
          <div>
            <dt>virtualization:</dt>
            <dd>
              Proxmox <span aria-hidden="true">/</span> VMware{" "}
              <span aria-hidden="true">/</span> KVM
            </dd>
          </div>
          <div>
            <dt>containers:</dt>
            <dd>
              Kubernetes <span aria-hidden="true">/</span>{" "}
              <span>
                <T es={"Contenedores"} en={"Containers"} />
              </span>
            </dd>
          </div>
          <div>
            <dt>observability:</dt>
            <dd>
              Grafana <span aria-hidden="true">/</span> Prometheus{" "}
              <span aria-hidden="true">/</span> Loki
            </dd>
          </div>
          <div>
            <dt>scripting:</dt>
            <dd>
              Bash <span aria-hidden="true">/</span> Python{" "}
              <span aria-hidden="true">/</span> Go
            </dd>
          </div>
          <div>
            <dt>practices:</dt>
            <dd>
              IaC <span aria-hidden="true">/</span> CI/CD{" "}
              <span aria-hidden="true">/</span> DevOps{" "}
              <span aria-hidden="true">/</span> SRE
            </dd>
          </div>
          <div>
            <dt>infrastructure:</dt>
            <dd>
              <span>
                <T es={"Redes"} en={"Networking"} />
              </span>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span>
                <T es={"Seguridad"} en={"Security"} />
              </span>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span>
                <T es={"Servidores web"} en={"Web servers"} />
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function Homelab() {
  return (
    <section
      className="content-section"
      id="homelab"
      aria-labelledby="homelab-title"
    >
      <div className="section-meta">
        <span>~/homelab/</span>
        <span>SELF-HOSTED</span>
      </div>
      <div className="homelab-grid">
        <div>
          <h2 id="homelab-title" tabIndex={-1} data-view-heading>
            <span className="heading-prefix">#</span> Homelab
          </h2>
          <p className="lead">
            <T
              es={"Software libre, self-hosting y hardware."}
              en={"Free software, self-hosting and hardware."}
            />
          </p>
          <p>
            <T
              es={
                "Tengo un homelab personal y sigo las comunidades de Grafana e Informáticos de Mendoza."
              }
              en={
                "I have a personal homelab and follow the Grafana and Informáticos de Mendoza communities."
              }
            />
          </p>
        </div>
        <div className="ascii-rack" aria-hidden="true">
          <pre>{`┌─────────────────────┐
│  ▣  homelab.local   │
├─────────────────────┤
│  ▪ ▪   ▤ ▤ ▤ ▤ ▤    │
├─────────────────────┤
│  ▪ ▪   ▤ ▤ ▤ ▤ ▤    │
├─────────────────────┤
│  ▪ ▪   ▤ ▤ ▤ ▤ ▤    │
└─────────────────────┘`}</pre>
        </div>
      </div>
    </section>
  );
}

export function Articles() {
  return (
    <section
      className="content-section"
      id="articulos"
      aria-labelledby="articles-title"
    >
      <div className="section-meta">
        <span>
          <T es={"~/articulos/"} en={"~/articles/"} />
        </span>
        <span>TEXT FILES</span>
      </div>
      <h2 id="articles-title" tabIndex={-1} data-view-heading>
        <span className="heading-prefix">#</span>{" "}
        <span>
          <T es={"Artículos"} en={"Articles"} />
        </span>
      </h2>
      <div className="empty-directory">
        <span className="empty-icon" aria-hidden="true">
          [ ]
        </span>
        <div>
          <p>
            <T
              es={"Sin artículos cargados por ahora."}
              en={"No articles added yet."}
            />
          </p>
          <span className="comment">0 files</span>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section
      className="content-section contact-section"
      id="contacto"
      aria-labelledby="contact-title"
    >
      <div className="section-meta">
        <span>
          <T es={"~/contacto.sh"} en={"~/contact.sh"} />
        </span>
        <span>
          <T es={"CONECTEMOS"} en={"LET'S CONNECT"} />
        </span>
      </div>
      <p className="command">
        <span className="blue">$</span> ./contacto.sh
      </p>
      <h2 id="contact-title" tabIndex={-1} data-view-heading>
        <T
          es={"Hablemos de infraestructura."}
          en={"Let's talk infrastructure."}
        />
      </h2>
      <p className="contact-description">
        <T
          es={
            "Si estás buscando un perfil de Sysadmin, SRE, DevOps o administración cloud, podés escribirme por email o LinkedIn. También podés contactarme por proyectos de consultoría en infraestructura, automatización y modernización."
          }
          en={
            "If you're hiring for a Sysadmin, SRE, DevOps, or cloud administration role, reach out by email or LinkedIn. You can also contact me about infrastructure consulting, automation, and modernization projects."
          }
        />
      </p>
      <a className="email-link" href="mailto:tomas.boquite@gmail.com">
        tomas.boquite@gmail.com
      </a>
      <div className="contact-links">
        <a href="mailto:tomas.boquite@gmail.com" className="button primary">
          <T es={"Escribime un email"} en={"Write me an email"} />
        </a>
        <a
          href="https://www.linkedin.com/in/tom%C3%A1s-alejandro-boquite"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/talejandro"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
