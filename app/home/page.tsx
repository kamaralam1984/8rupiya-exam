import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { TrackHome } from "./TrackHome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Home — 8Rupia",
  description: "Personalized study home for your exam track.",
  robots: { index: false, follow: false },
};

export default async function HomePage() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) redirect("/signin?next=/home");
    throw e;
  }
  if (!user.examTrack) redirect("/onboarding");

  // Pull a few recent personalized signals server-side
  const [attempts, exam] = await Promise.all([
    db.attempt.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        score: true,
        accuracy: true,
        startedAt: true,
        testSet: { select: { slug: true, title: true } },
      },
    }),
    db.exam.findUnique({
      where: { slug: user.examTrack },
      select: {
        id: true,
        name: true,
        slug: true,
        testSets: {
          where: { isPublished: true },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            slug: true,
            title: true,
            description: true,
            durationMin: true,
            isPremium: true,
            priceInPaise: true,
          },
        },
        subjects: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return (
    <TrackHome
      trackSlug={user.examTrack}
      userName={user.name ?? user.email ?? user.phone ?? "Student"}
      xp={user.xp}
      streak={user.streak}
      attempts={attempts.map((a) => ({
        id: a.id,
        status: a.status,
        score: a.score,
        accuracy: a.accuracy,
        startedAt: a.startedAt.toISOString(),
        testSetSlug: a.testSet.slug,
        testSetTitle: a.testSet.title,
      }))}
      testSets={exam?.testSets ?? []}
      subjects={exam?.subjects ?? []}
    />
  );
}
