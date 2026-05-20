import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReaderClient } from "./ReaderClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reader · 8Rupia Library",
  robots: { index: false, follow: false },
};

export default async function ReaderPage({ params }: { params: Promise<{ pdfId: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) redirect("/signin?next=/library");
    throw e;
  }
  if (user.examTrack !== "class-10") redirect("/library");

  const { pdfId } = await params;
  const pdf = await db.pdf.findUnique({
    where: { id: pdfId },
    select: {
      id: true,
      filename: true,
      pageCount: true,
      fileSize: true,
      config: true,
      exam: { select: { slug: true, name: true } },
    },
  });
  if (!pdf || pdf.exam?.slug !== "class-10") notFound();

  const title = (pdf.config as any)?.title ?? pdf.filename.replace(/\.pdf$/i, "");
  const subjectSlug = (pdf.config as any)?.subjectSlug ?? null;

  return (
    <ReaderClient
      pdfId={pdf.id}
      title={title}
      filename={pdf.filename}
      pageCount={pdf.pageCount}
      subjectSlug={subjectSlug}
      examName={pdf.exam.name}
    />
  );
}
