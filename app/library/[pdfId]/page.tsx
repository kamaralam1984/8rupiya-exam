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

export default async function ReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ pdfId: string }>;
  searchParams: Promise<{ page?: string; hl?: string }>;
}) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) redirect("/signin?next=/library");
    throw e;
  }
  const isAdmin = user.role === "ADMIN";

  const { pdfId } = await params;
  const { page, hl } = await searchParams;
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
  if (!pdf) notFound();
  // Access: admin → any PDF. Otherwise the PDF's exam must match the user's
  // track. (Previously hard-coded to class-10 only; relaxed so any exam track
  // works with the "Open in Book" result-page feature.)
  if (!isAdmin && pdf.exam?.slug !== user.examTrack) notFound();

  const title = (pdf.config as any)?.title ?? pdf.filename.replace(/\.pdf$/i, "");
  const subjectSlug = (pdf.config as any)?.subjectSlug ?? null;
  const parsedPage = page ? parseInt(page, 10) : NaN;
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : null;

  return (
    <ReaderClient
      pdfId={pdf.id}
      title={title}
      filename={pdf.filename}
      pageCount={pdf.pageCount}
      subjectSlug={subjectSlug}
      examName={pdf.exam?.name ?? "Uncategorized"}
      initialPage={initialPage}
      initialHighlight={hl ?? null}
    />
  );
}
