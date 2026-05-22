import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EXAMS, getExam } from "@/lib/exams";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/utils";
import { BookOpen, Brain, Target, LineChart, Clock, ChevronRight } from "lucide-react";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function generateStaticParams() {
  return EXAMS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) return {};
  return {
    title: `${exam.name} Mock Test — AI Prep, Predicted Sets & Analytics`,
    description: `${exam.name} (${exam.short}) AI-powered mock tests, topic-wise drills, prediction sets and weakness analytics. Unlock premium ${exam.name} mocks for just ₹8.`,
    alternates: { canonical: `/exams/${exam.slug}` },
    openGraph: {
      title: `${exam.name} Mock Test — ${SITE.name}`,
      description: exam.description,
      url: `${SITE.url}/exams/${exam.slug}`,
    },
  };
}

const TEST_TYPES = [
  { icon: BookOpen, title: "Topic-wise Mocks", body: "Short sectional drills on individual chapters." },
  { icon: Brain, title: "AI Prediction Set", body: "Likely questions based on past paper patterns." },
  { icon: Target, title: "Previous Year Analysis", body: "Decade-long pattern of repeated topics." },
  { icon: LineChart, title: "Full Length Test", body: "Real-exam timed simulation with analytics." },
];

export default async function ExamPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Exams", item: `${SITE.url}/exams` },
      { "@type": "ListItem", position: 3, name: exam.name, item: `${SITE.url}/exams/${exam.slug}` },
    ],
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${exam.name} Mock Test — AI Prep & Predictions`,
    description: exam.description,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/exams/${exam.slug}`,
  };

  return (
    <>
      <section className="container pt-12 md:pt-16">
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link href="/exams" className="hover:text-foreground">Exams</Link></li>
            <li>/</li>
            <li className="text-foreground">{exam.name}</li>
          </ol>
        </nav>
        <div className="glass rounded-3xl p-8 md:p-10 gradient-border">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            {exam.name} <span className="gradient-text">Mock Tests</span>
          </h1>
          <p className="mt-2 text-muted-foreground">{exam.short}</p>
          <p className="mt-5 max-w-3xl">{exam.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {exam.subjects.map((s) => (
              <span key={s} className="text-xs px-3 py-1 rounded-full bg-muted">{s}</span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {exam.duration}</span>
            <span>· {exam.questions} questions</span>
            <span>· ₹8 unlock</span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/test-config/${exam.slug}`}>
              <Button size="lg">Custom Mock Test</Button>
            </Link>
            <Link href={`/test/${exam.slug}-sample-mock`}>
              <Button size="lg" variant="glass">Quick Free Test</Button>
            </Link>
            <Link href={`/test/${exam.slug}-premium-mock-1`}>
              <Button size="lg" variant="outline">Unlock Premium ₹8</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subject-wise free mocks */}
      <section className="container pt-12">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Subject-wise mock tests
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Apna favourite subject choose karo aur sirf usi pe practice karo. 100% free.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Free · No payment needed
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exam.subjects.map((s) => {
            const subSlug = slugify(s);
            return (
              <Link
                key={s}
                href={`/test/${exam.slug}-${subSlug}-mock`}
                className="group"
              >
                <div className="glass rounded-2xl p-5 gradient-border h-full flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                  <div className="h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-accent/20 shrink-0">
                    <BookOpen className="h-5 w-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-tight">{s}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Subject-only drill · {exam.name}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container py-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Test types for {exam.name}
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEST_TYPES.map((t) => (
            <div key={t.title} className="glass rounded-2xl p-5 gradient-border">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent/20">
                <t.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="mt-3 font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold">Study tips for {exam.name}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Attempt one full-length mock weekly and review every wrong answer.</li>
            <li>Use the AI weakness analyzer after each test to focus on lowest-accuracy chapters.</li>
            <li>Maintain a 30–60 minute revision habit on high-weightage topics surfaced by the prediction model.</li>
            <li>Track speed and accuracy separately — most students lose marks to time, not knowledge.</li>
          </ul>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
    </>
  );
}
