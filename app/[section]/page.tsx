import { notFound } from "next/navigation";
import {
  About,
  Articles,
  Contact,
  Experience,
  Homelab,
  Projects,
  TechStack,
} from "../../components/section-content";
import { isSection, sections, sectionSlugs } from "../../components/routes";

const views = {
  "sobre-mi": About,
  experiencia: Experience,
  proyectos: Projects,
  stack: TechStack,
  homelab: Homelab,
  articulos: Articles,
  contacto: Contact,
};

type SectionPageProps = { params: Promise<{ section: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return sectionSlugs.map((section) => ({ section }));
}

export async function generateMetadata({ params }: SectionPageProps) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  return { title: sections[section].es };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  const View = views[section];
  return <View />;
}
