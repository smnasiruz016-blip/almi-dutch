import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CAPLE_EXAMS, examBySlug } from "@/lib/pt/registry";
import { buildLevelPage } from "@/lib/seo/content";
import { FunnelPage } from "@/components/seo/FunnelPage";

// Only 6 CAPLE levels — pre-render all at build.
export const dynamicParams = false;
export function generateStaticParams() {
  return CAPLE_EXAMS.map((e) => ({ level: e.slug }));
}

type Params = Promise<{ level: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { level } = await params;
  const exam = examBySlug(level);
  if (!exam || exam.variant !== "EUROPEAN") return { title: "Not found" };
  const p = buildLevelPage(exam);
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDescription,
    alternates: { canonical: p.canonicalPath },
    openGraph: { title: p.h1, description: p.metaDescription },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { level } = await params;
  const exam = examBySlug(level);
  if (!exam || exam.variant !== "EUROPEAN") notFound();
  return <FunnelPage page={buildLevelPage(exam)} />;
}
