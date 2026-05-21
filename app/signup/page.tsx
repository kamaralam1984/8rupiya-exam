import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { SignupClient } from "./SignupClient";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free 8Rupia account.",
  alternates: { canonical: "/signup" },
};

export const dynamic = "force-dynamic";

async function getActiveExams() {
  try {
    const exams = await db.exam.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    });
    return exams;
  } catch {
    return [];
  }
}

export default async function SignUpPage() {
  const exams = await getActiveExams();
  return (
    <section className="container pt-12 pb-20 max-w-md">
      <Suspense fallback={null}>
        <SignupClient exams={exams} />
      </Suspense>
    </section>
  );
}
