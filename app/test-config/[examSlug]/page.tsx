import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/exams";
import { ConfigStarter } from "./ConfigStarter";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: { params: Promise<{ examSlug: string }> }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExam(examSlug);
  return {
    title: exam ? `${exam.name} Custom Mock Test` : "Custom Mock Test",
    robots: { index: false, follow: false },
  };
}

export default async function TestConfigPage({
  params,
}: { params: Promise<{ examSlug: string }> }) {
  const { examSlug } = await params;
  const exam = getExam(examSlug);
  if (!exam) notFound();

  return <ConfigStarter examSlug={exam.slug} examName={exam.name} subjects={exam.subjects} subjectGroups={exam.subjectGroups} />;
}
