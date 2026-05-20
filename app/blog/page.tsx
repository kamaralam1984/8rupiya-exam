import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Exam Prep Tips, Strategy and Pattern Analyses",
  description:
    "Study strategies, exam pattern analysis, AI-curated revision tips and current affairs digests for CTET, SSC, Railway, Banking, CUET and other major Indian competitive exams.",
  alternates: { canonical: "/blog" },
};

const POSTS = [
  {
    slug: "ctet-paper-2-strategy",
    title: "CTET Paper 2 strategy: a section-wise plan that works",
    excerpt:
      "How to allocate your 150 minutes across Pedagogy, Maths/Science and Languages so you maximize marks without panicking on Pedagogy MCQs.",
  },
  {
    slug: "ssc-cgl-tier-1-time-management",
    title: "SSC CGL Tier-1: time management for the 60-minute crunch",
    excerpt:
      "A speed framework that gets you through Quant and Reasoning before English and GK eat your clock.",
  },
  {
    slug: "ai-weakness-analyzer-explained",
    title: "How our AI weakness analyzer actually picks your weak chapters",
    excerpt:
      "A peek under the hood at the accuracy, speed and guess-rate signals our model uses to recommend next steps.",
  },
];

export default function BlogPage() {
  return (
    <section className="container pt-12 md:pt-16 pb-20">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        From the <span className="gradient-text">8Rupia blog</span>
      </h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        Practical strategy posts, AI-curated revision tips and exam pattern breakdowns. Written
        by working teachers and the 8Rupia editorial team.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {POSTS.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="glass rounded-2xl p-6 gradient-border hover:-translate-y-0.5 transition"
          >
            <h2 className="font-display font-semibold text-lg">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
            <span className="mt-4 inline-block text-xs text-brand-600 dark:text-brand-400">
              Read article →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-3xl prose prose-invert text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold">What you will find here</h2>
        <p>
          Most blogs that publish for Indian competitive exam aspirants fall into two extremes.
          One extreme is the news desk that reposts every recruitment notification the moment it
          drops, with little context for the student trying to figure out what to do about it.
          The other extreme is the formulas-and-shortcuts site that repeats the same fifty
          shortcuts in different wrappings month after month. Both have a place. Neither is what
          we are trying to be.
        </p>
        <p>
          The 8Rupia blog is for the student who has already decided to prepare seriously and now
          wants to make better decisions about <strong>how</strong> they prepare. That means
          fewer formula posts and more strategy posts. Fewer hot-takes and more pattern analyses.
          When we cover a syllabus update, we explain what changed, why it matters and what to
          adjust in your plan; we do not just paste the official press release with a click-bait
          title.
        </p>

        <h2 className="text-2xl font-semibold mt-10">The categories we cover</h2>
        <p>
          <strong>Pattern analysis.</strong> Each major exam — CTET, SSC, Railway RRB, IBPS,
          SBI, CUET, State PSCs — has a question paper that drifts slowly year over year. New
          topics rise, old topics fade, weightages shift between sections. We publish a yearly
          pattern post for each major exam, backed by ten years of past-paper data, that shows
          you exactly where the weight is going so you can spend your study hours on what
          actually pays off in the exam hall.
        </p>
        <p>
          <strong>Strategy and time management.</strong> Many students lose marks not because
          they did not know the material, but because they spent twelve minutes on a single quant
          problem and ran out of clock for the easy questions later in the paper. Our strategy
          posts are written by practising teachers and previous-year toppers; they break down
          section-wise time budgets, sequencing rules ("attempt languages first when you are
          tired, never last") and what to do in the last five minutes of a paper.
        </p>
        <p>
          <strong>Pedagogy and concept clarity.</strong> Tests measure many things, but
          fundamentally they measure whether you understood the concept. Our concept posts pick
          one tricky idea — say, the difference between average velocity and average speed, or
          how the Indian Constitution distributes residuary powers — and unpack it the way a
          patient teacher would. Each concept post ends with three practice questions so you can
          immediately check whether the explanation landed.
        </p>
        <p>
          <strong>Current affairs digests.</strong> Most current affairs posts on the internet
          are an undifferentiated stream of trivia. Our digests are filtered by exam: a banking
          aspirant should care about repo-rate changes and the latest RBI report; a State PSC
          aspirant should care about state-specific events; both can safely ignore each other&apos;s
          feed. Each digest also tags items by likelihood of appearing in an actual question,
          based on historical patterns.
        </p>
        <p>
          <strong>Behind-the-scenes notes from the platform.</strong> Periodically we publish
          notes about how the 8Rupia platform itself works — how our AI weakness analyzer scores
          attempts, how our predicted question sets are built, how we tag past-year questions by
          topic. Transparency is part of trust: if you are going to rely on a recommendation, you
          deserve to know how it was generated.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Our editorial standards</h2>
        <p>
          Every post on this blog is reviewed by at least one subject teacher before it goes
          live. We fact-check claims, cite official sources where available and avoid speculation
          framed as fact. Posts about the syllabus or the exam pattern always link to the
          official notification we are referring to. When we cite statistics — pass rates,
          cut-off trends, vacancy numbers — we attach the source and the year.
        </p>
        <p>
          We do not publish "leaked paper" claims, "guaranteed selection" promises or "secret
          shortcut" headlines that turn out to be a re-skin of standard advice. Such content
          attracts traffic but it damages the trust of the students we are trying to serve. We
          have turned away sponsorship deals that asked us to soften this rule.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Want to write for us?</h2>
        <p>
          If you are a working teacher, a previous-year topper or an EdTech writer, we welcome
          guest posts. Pitches that work best are concrete and narrow: a single concept, a single
          time-management framework, a single past-paper analysis. We pay a modest honorarium
          per accepted post and you keep author credit and a backlink. Send a pitch (with a
          writing sample) through the <Link href="/contact" className="text-brand-500">
          contact page</Link>.
        </p>
        <p>
          More posts are added every week. If you do not see your exam covered yet, write in
          with the topic you wish someone would write — we keep a public wish list and many of
          the most popular posts on the blog started as a reader request.
        </p>
      </div>
    </section>
  );
}
