import type { Metadata } from "next";
import { ResultView } from "./ResultView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Test result",
  robots: { index: false, follow: false },
};

export default async function ResultPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultView attemptId={id} />;
}
