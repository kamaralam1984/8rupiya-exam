import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser, AuthError } from "@/lib/auth";
import { LibraryClient } from "./LibraryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library — Read & Ask AI · 8Rupia",
  description: "Read your Class 10 books online and ask any doubt to AI without leaving the page.",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) redirect("/signin?next=/library");
    throw e;
  }
  if (!user.examTrack && user.role !== "ADMIN") redirect("/onboarding");
  if (user.role !== "ADMIN" && user.examTrack !== "class-10") {
    return (
      <section className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Library — Class 10 only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The online book reader is currently in beta for Class 10 Boards students. We&apos;ll
            expand it to other tracks soon.
          </p>
        </div>
      </section>
    );
  }
  return <LibraryClient />;
}
