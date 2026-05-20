import type { Metadata } from "next";
import { TestStarter } from "./TestStarter";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Mock Test · ${slug}`,
    robots: { index: false, follow: false },
  };
}

export default async function TestPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TestStarter testSetSlug={slug} />;
}
