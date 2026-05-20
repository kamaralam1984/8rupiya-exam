import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About 8Rupia — Our Story, Mission and Method",
  description: `Learn how ${SITE.name} uses AI to make high-quality exam preparation affordable for every Indian student. Read about our mission, methodology, leadership and commitment to academic integrity.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="container pt-12 md:pt-16 pb-20 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        About <span className="gradient-text">{SITE.name}</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We are an AI-powered exam preparation platform built for Indian students. Our promise is
        simple: high-quality coaching, intelligent analytics and personalized study guidance should
        not depend on a family&apos;s income.
      </p>

      <div className="mt-8 prose prose-invert max-w-none text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold mt-10">Why we started 8Rupia</h2>
        <p>
          Every year, more than fifty million students across India take competitive examinations
          such as CTET, SSC, Railway, Banking, CUET, State PSCs, Police Constable and Class 10
          Boards. The coaching industry that prepares them is large, valuable and unevenly priced.
          A student from a metro city can spend twenty to forty thousand rupees on a single
          season of classroom coaching. A student from a small town often cannot. Yet both write
          the same paper, on the same day, under the same conditions.
        </p>
        <p>
          We started {SITE.name} because that gap has nothing to do with talent. It has everything
          to do with access to good practice material, honest analytics and a thoughtful daily plan.
          Our entire product is shaped by one constraint: a student who has eight rupees in their
          wallet should be able to take a complete premium mock test, get a serious AI weakness
          report on it, and walk away with a clear plan for what to study next.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Our mission</h2>
        <p>
          Our mission is to make rigorous, modern exam preparation available to the next hundred
          million Indian students at a price they can afford without thinking twice. We measure
          ourselves on three things: <strong>quality</strong> of the practice content,
          <strong> clarity</strong> of the feedback we give, and <strong>cost</strong>. If any of
          those three slip, we have failed the student we built this for.
        </p>

        <h2 className="text-2xl font-semibold mt-10">What we offer</h2>
        <p>
          The {SITE.name} platform combines several learning tools that traditionally cost more
          when bought separately. Students can take full-length mock tests calibrated to specific
          exam patterns and difficulty curves, generate AI-curated predicted question sets weighted
          by historical topic frequency, and study from past-year question archives indexed by
          year, subject and topic.
        </p>
        <p>
          Beyond the practice content, our AI weakness analyzer reads each attempt and reports
          which subjects, chapters and question types are dragging the student down. The same
          analysis feeds an AI study planner that lays out a day-by-day, week-by-week plan based
          on how many days remain before the target exam. Students who get stuck on a specific
          problem can use the AI Doubt Solver in either Hindi or English, paste a photo of the
          question if needed, and receive a step-by-step explanation in seconds.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Our methodology</h2>
        <p>
          We do not believe in mystery models. Every score, every recommendation and every
          prediction on the platform can be traced to the data that produced it. Our weakness
          analyzer combines four signals: accuracy by chapter, average time spent per question,
          flagged-and-skipped rates, and a guess-pattern detector that compares the student&apos;s
          confidence with their actual outcome.
        </p>
        <p>
          Our prediction sets are educational study aids. They are produced by analyzing publicly
          available previous-year question papers, looking for repeated topics, weightage shifts
          and rising chapters, and then generating fresh original questions in the same style.
          We do not claim and have never claimed to reproduce upcoming exam papers. The
          prediction confidence score next to each question tells the student exactly how strong
          the historical pattern is — there is no marketing magic.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Languages and accessibility</h2>
        <p>
          The platform is bilingual: every part of the interface, every doubt-solver response and
          every weakness report can be served in Hindi or English. We treat translation as a
          first-class feature rather than a bolt-on. Question stems and options are translated by
          AI on demand and cached per question, so once a question has been seen once in a given
          language, future students get an instant switch with no extra cost or wait.
        </p>
        <p>
          We have invested in mobile-first design from day one. More than eighty percent of our
          users open the site on a phone, often on a slow data connection, sometimes with limited
          screen size. The site is installable as a Progressive Web App, so once a student opens
          it, the app icon sits next to their other apps and works offline for cached content.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Academic integrity</h2>
        <p>
          {SITE.name} does not, and will never, claim to leak, share or reproduce confidential
          exam papers. Any content advertised as a &quot;leaked&quot; paper is a scam, and we
          encourage students to report such material wherever they see it. Our predicted sets are
          educational projections, marked as such, with confidence scores that the student can
          interpret for themselves.
        </p>
        <p>
          We also take care to protect the work of textbook authors and question-paper compilers.
          When we ingest content from a PDF that an administrator uploads, our system rephrases
          and restructures rather than copies. Where we display past-year questions verbatim — for
          example, on the previous-year search page — we present them as study material under fair
          academic use, with the source paper attribution clearly visible.
        </p>

        <h2 className="text-2xl font-semibold mt-10">How we are funded</h2>
        <p>
          The platform sustains itself through a small number of paid features: the eight-rupee
          unlock for an individual premium test, optional monthly subscriptions for unlimited
          access, and educational advertisements on certain free pages. We do not sell student
          data, and we do not pass personal information to third parties for marketing. Our
          revenue model is intentionally tiny per student so that the price never becomes a
          barrier to the learning itself.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Get in touch</h2>
        <p>
          We would love to hear from teachers, school administrators and student communities who
          want to bring affordable preparation to their classroom. Reach us via the
          <Link href="/contact" className="text-brand-500 hover:underline"> contact page</Link>,
          or read our public <Link href="/disclaimer" className="text-brand-500 hover:underline">
          disclaimer</Link>, <Link href="/privacy" className="text-brand-500 hover:underline">
          privacy policy</Link> and <Link href="/terms" className="text-brand-500 hover:underline">
          terms of service</Link> for the legal details.
        </p>
      </div>
    </article>
  );
}
