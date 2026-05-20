import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Disclaimer — 8Rupia",
  description: `Important disclaimers about the educational nature of ${SITE.name}: AI-generated content, predicted question sets, fair-use of past papers, accuracy and the limits of our guarantees.`,
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <article className="container pt-12 md:pt-16 pb-20 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        Disclaimer
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: May 2026</p>
      <p className="mt-4 text-lg text-muted-foreground">
        This disclaimer explains the educational nature of {SITE.name}, the limits of what our
        AI-driven content can and cannot do, and the responsible boundaries we have placed
        around prediction features, past-paper content and answer keys.
      </p>

      <div className="mt-10 prose prose-invert max-w-none text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold">1. Educational use only</h2>
        <p>
          Every piece of content on {SITE.name} — including mock tests, AI predicted sets,
          previous-year question archives, weakness reports, study plans, doubt-solver responses,
          revision notes and current-affairs digests — is provided as an educational study aid.
          It is intended to help students prepare for an exam, not to replace official sources.
          For authoritative information about syllabus, exam dates, exam pattern, eligibility,
          application process, admit cards and final results, always refer to the official
          notification issued by the conducting authority.
        </p>

        <h2 className="text-2xl font-semibold mt-10">2. No leaked papers, ever</h2>
        <p>
          {SITE.name} does <strong>not</strong>, and has never, claimed to leak, reproduce,
          obtain or share confidential or unreleased examination papers. Our predicted question
          sets are educational projections built by analysing publicly available previous-year
          question papers, syllabus weightages and topic-frequency trends. They are NOT actual
          exam papers and do NOT reflect any confidential information.
        </p>
        <p>
          We display, where applicable, a confidence score (a number from 0 to 100) next to each
          predicted question. This score reflects how strongly the historical pattern supports
          the question, based on the past-year data we used. A high confidence score is not a
          guarantee that the question will appear in any specific exam; it is an estimate of
          historical pattern strength.
        </p>
        <p>
          If you encounter any content on the internet — including content claiming to come from
          {SITE.name} — that promises a leaked or pre-released paper, please treat it as a scam
          and do not act on it. We encourage you to report such content to the relevant exam
          authority and, if it impersonates us, to write to our{" "}
          <Link href="/contact" className="text-brand-500">contact page</Link> so we can issue
          takedown notices.
        </p>

        <h2 className="text-2xl font-semibold mt-10">3. No guarantee of results</h2>
        <p>
          Practising on {SITE.name} can help you understand exam patterns, identify weak areas
          and improve through deliberate, measured study. However, no preparation platform —
          ours or anyone else&apos;s — can guarantee selection, rank or any specific score in a
          competitive exam. Outcomes depend on many factors, including the student&apos;s own
          consistency, time invested, baseline knowledge, exam-day performance, the
          competition&apos;s strength and the conducting authority&apos;s evaluation process.
        </p>
        <p>
          We deliberately avoid making promises about outcomes. We will tell you what topics
          historically appear most often, what your individual data shows you are weak in and
          how a typical good attempt is sequenced. We will not tell you that you are guaranteed
          to pass.
        </p>

        <h2 className="text-2xl font-semibold mt-10">4. AI-generated content and its limits</h2>
        <p>
          Many features on {SITE.name} are powered by large language models — our predicted sets,
          our weakness summaries, our study plans, our doubt-solver explanations and our
          translations. AI models are powerful but not infallible. They occasionally produce
          answers that are subtly wrong, outdated relative to the latest syllabus, or that
          oversimplify a nuanced concept. We invest a substantial amount of engineering in
          guardrails, schema validation, post-checks and human-reviewed approval flows to keep
          this rare, but it is impossible to eliminate.
        </p>
        <p>
          If you spot an error in an AI-generated answer or explanation, please use the
          <em> Report this question</em> link visible inside each question, or write to us with
          the URL and a short note. Reports are reviewed by a human, and corrections are
          published quickly. Your reports make the content better for the next student.
        </p>
        <p>
          For mission-critical decisions — choosing a college, accepting an offer, deciding
          whether to skip a year — please cross-check anything we say against the official
          source. The doubt-solver is a study aid, not a counsellor; it can explain a
          mathematics problem better than it can advise you on life choices.
        </p>

        <h2 className="text-2xl font-semibold mt-10">5. Past-year questions and fair use</h2>
        <p>
          Where we display previous-year exam questions verbatim — for example, in the
          previous-year search archive — we do so under fair academic use, with the source
          paper attribution clearly visible. We do not claim copyright over questions that were
          authored by the exam-conducting authority. If you are a rights-holder and believe a
          specific item on our platform should not appear, please contact us through the
          <em> Copyright Notice</em> channel described on our{" "}
          <Link href="/contact" className="text-brand-500">contact page</Link>, and we will act
          on credible notices within seventy-two hours.
        </p>
        <p>
          AI-generated questions inspired by previous-year patterns are original works produced
          by our system; they are not verbatim reproductions of any existing paper. We design
          our prompts to rephrase, restructure and generalise, rather than copy.
        </p>

        <h2 className="text-2xl font-semibold mt-10">6. Answer keys and correctness</h2>
        <p>
          Every question on the platform has a marked correct answer, either provided by the
          original source (in the case of past-year questions with public keys) or assigned by
          our AI generator (in the case of fresh questions). For freshly generated questions
          that have not yet been reviewed by a human, we keep the question in an
          <em> unapproved</em> state — these are visible to administrators but are not surfaced
          inside graded student tests. The questions you see inside a paid mock test are the
          ones that have either been authored by an editor or have passed a human review.
        </p>
        <p>
          Disagreements about a correct answer happen — sometimes a question is genuinely
          ambiguous, sometimes a key was wrong, sometimes the syllabus has shifted since the
          original paper. If you believe the marked answer is incorrect, please report it. We
          will review, correct the key if needed and adjust scores retroactively where the change
          materially affects a graded attempt.
        </p>

        <h2 className="text-2xl font-semibold mt-10">7. Third-party content and ads</h2>
        <p>
          The site may display third-party advertisements on certain free pages. We do not
          control the content of those ads. Clicking an ad will take you to a third-party
          website that has its own privacy and content policies; we are not responsible for the
          accuracy or behaviour of those websites. We do, however, refuse advertising categories
          that we consider inappropriate for an educational platform.
        </p>

        <h2 className="text-2xl font-semibold mt-10">8. Trademarks and brand references</h2>
        <p>
          Exam names — CTET, SSC, IBPS, SBI, RRB, CUET, NIIT NAT, KVS, DSSSB, BPSC, UPPSC, MPPSC
          and others — are trademarks or registered marks of their respective rights-holders. We
          use them solely to describe the exams our platform helps you prepare for. {SITE.name}
          is not affiliated with, endorsed by or sponsored by any examination board or
          recruitment agency unless explicitly stated.
        </p>

        <h2 className="text-2xl font-semibold mt-10">9. Changes to this disclaimer</h2>
        <p>
          We will update this disclaimer as our platform evolves, particularly as we add new
          AI-driven features. Material changes will be announced on the home page. The "Last
          updated" date at the top reflects the most recent revision.
        </p>

        <h2 className="text-2xl font-semibold mt-10">10. Contact</h2>
        <p>
          Questions about this disclaimer can be sent through our{" "}
          <Link href="/contact" className="text-brand-500">contact page</Link>. For our broader
          legal documents see the <Link href="/terms" className="text-brand-500">terms of
          service</Link> and the <Link href="/privacy" className="text-brand-500">privacy
          policy</Link>.
        </p>
      </div>
    </article>
  );
}
