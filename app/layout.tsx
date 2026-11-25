import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { PortfolioShell } from "../components/portfolio-shell";
import { basePath } from "../components/routes";
import "./globals.css";

const departure = localFont({
  src: "./fonts/DepartureMono-Regular.otf",
  variable: "--font-departure",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
});

const vergilia = localFont({
  src: "./fonts/Vergilia.ttf",
  variable: "--font-vergilia",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    default: "Tomás Boquite | Sysadmin & SRE",
    template: "%s | Tomás Boquite",
  },
  description:
    "Tomás Boquite · Sysadmin & SRE. Experiencia en Linux, Windows, AWS, Azure, Kubernetes, CI/CD y observabilidad. Mendoza, Argentina.",
  icons: { icon: `${basePath}/assets/symbol.png` },
};

export const viewport: Viewport = { themeColor: "#2b2d2f" };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${departure.variable} ${vergilia.variable}`}>
      <body>
        <PortfolioShell>{children}</PortfolioShell>
      </body>
    </html>
  );
}
