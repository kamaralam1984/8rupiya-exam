import type { Metadata } from "next";
import Link from "next/link";
import { ExamGrid } from "@/components/exam-grid";

export const metadata: Metadata = {
  title: "All Exams — Mock Tests, Predicted Sets and PYQ Archives",
  description:
    "Browse AI-powered mock tests, prediction sets and previous-year analyses for CTET, SSC, Railway, Banking, CUET, Class 10, NIIT, Police, Teacher and State exams — unlock premium tests for ₹8.",
  alternates: { canonical: "/exams" },
};

export default function ExamsPage() {
  return (
    <>
      <section className="container pt-12 md:pt-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          All <span className="gradient-text">Exams</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Pick your exam to access topic-wise mocks, full-length tests, AI prediction sets and a
          personalised weakness analyser. Each track is calibrated to the official exam pattern.
        </p>
      </section>
      <ExamGrid />

      <section className="container max-w-3xl mt-16 prose prose-invert text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold">The full 8Rupia exam catalogue, in plain language</h2>
        <p>
          Every exam on this page is supported by the same four building blocks: a calibrated
          mock-test engine, an AI-generated predicted set, a previous-year question archive
          searchable by topic and year, and a personalised weakness analyser. The look-and-feel
          of the dashboard changes for each track, but the underlying engine is the same. That
          consistency matters: a student who learns how to read their CTET weakness report can
          immediately read their SSC weakness report the same way.
        </p>

        <h2 className="text-2xl font-semibold mt-10">CTET — Central Teacher Eligibility Test</h2>
        <p>
          The CTET is conducted by the CBSE for candidates who want to teach in central
          government schools (and is widely accepted by state-run schools too). Paper I targets
          teachers of classes I-V and Paper II targets classes VI-VIII. The combined preparation
          spans Child Development and Pedagogy, Environmental Studies, Mathematics, two
          languages and (for Paper II) either Maths and Science or Social Studies. Pedagogy is
          the single highest-scoring section for serious aspirants, and our predicted sets weigh
          it accordingly.
        </p>

        <h2 className="text-2xl font-semibold mt-10">SSC — Staff Selection Commission</h2>
        <p>
          The SSC family covers CGL (Combined Graduate Level), CHSL (Combined Higher Secondary
          Level), MTS (Multi-Tasking Staff), CPO, Stenographer and more. The core sections —
          Quantitative Aptitude, Reasoning, English Language and General Awareness — are common
          across most SSC papers, but the difficulty curve and time budgets differ. Our SSC
          track keeps separate calibrations for CGL Tier-1, CHSL Tier-1 and MTS, so the mock
          experience matches the actual paper you are sitting.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Railway — RRB Group D, NTPC and ALP</h2>
        <p>
          The Railway Recruitment Board exams (RRB Group D, NTPC, ALP and Technician) draw the
          largest applicant pool in the country. Our Railway track focuses on the high-yield
          sections: General Awareness (which has the widest spread and the most repeated
          topics), Maths, Reasoning and General Science. The signature feature for this track is
          the daily General Awareness marathon — a thirty-question rolling drill rebuilt every
          day from the previous-year repeat pool.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Banking — IBPS, SBI and RBI Grade B</h2>
        <p>
          Bank PO, Clerk and SO papers reward speed, discipline and pattern recognition.
          Sectional cut-offs and section-wise timers are unique to banking; our Banking track
          mimics them exactly, including the strict per-section timer that distinguishes IBPS
          Mains from many other exams. We focus our predicted sets on Reasoning, Quant, English
          Language and the GA + Banking Awareness section that decides marks in the final
          shortlist.
        </p>

        <h2 className="text-2xl font-semibold mt-10">CUET — Common University Entrance Test</h2>
        <p>
          CUET-UG is the consolidated entrance for central universities, and CUET-PG is its
          post-graduate counterpart. The unique challenge of CUET is the domain plus general
          plus language combination, where students choose their domain subjects and the rest of
          the paper is built around them. Our CUET track lets you build a personalised two-domain
          mock in one tap so your practice always matches the combination you have chosen.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Class 10 Boards</h2>
        <p>
          The Class 10 board exam track is built for CBSE and major state boards. Where CBSE
          Sample Papers are the single best source for question style, our chapter-wise drill
          generator lets a student pick a chapter, name a difficulty level and immediately get a
          board-style mini test. We keep our Class 10 content NCERT-aligned, with cross-checks
          against the latest sample papers.
        </p>

        <h2 className="text-2xl font-semibold mt-10">NIIT NAT</h2>
        <p>
          The NIIT National Aptitude Test combines aptitude, English, computer awareness and
          logical reasoning. The signature daily feature for this track is the Logic Lab — a
          set of coding-logic puzzles that grow in difficulty over the week, with stepwise
          hints rather than just a final answer.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Police and State SI exams</h2>
        <p>
          State police constable and sub-inspector exams typically balance reasoning, general
          awareness, mathematics and state-specific GK. The signature feature for this track is
          the Drill Mode — a rapid-fire fifty-question set with no negative marking, designed to
          build the kind of speed and stamina that constable-level papers reward.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Teacher exams — TET, KVS, DSSSB, NVS</h2>
        <p>
          The Teacher track aggregates the central and state TET papers along with KVS, DSSSB
          and NVS recruitment papers. We let you combine Paper I and Paper II preparation
          flexibly, and our TET Combiner builds an attack plan that reflects the specific
          subjects you have chosen.
        </p>

        <h2 className="text-2xl font-semibold mt-10">State PSCs — BPSC, UPPSC, MPPSC, MPSC</h2>
        <p>
          State Public Service Commission exams share the same core subjects as the UPSC —
          Indian Polity, History, Geography, Economy — but add a strong state-specific GK
          component that varies sharply from one state to another. Our State PSC track ships
          with a State Radar that surfaces state-specific current affairs daily, separating them
          from national news.
        </p>

        <h2 className="text-2xl font-semibold mt-10">How we keep coverage fresh</h2>
        <p>
          Syllabi shift. Notifications shift. Pattern changes are usually announced quietly,
          often a month or two before the exam. We monitor the official conducting-body websites
          for each exam in our catalogue, refresh our test sets and update our blog whenever a
          material change drops. If we have not yet updated a specific exam page for an
          announcement you have just heard about, please write to us — we publish the change as
          soon as we have verified the source.
        </p>

        <h2 className="text-2xl font-semibold mt-10">What if my exam is not listed?</h2>
        <p>
          We add new exam tracks based on student demand. If you do not see your target exam in
          the grid above, head to the <Link href="/contact" className="text-brand-500">
          contact page</Link>, mention <em>Exam Request</em> in the subject and tell us the exam
          name and your target cycle. Exam tracks that have at least a few hundred interested
          students typically launch within the next quarter.
        </p>
      </section>
    </>
  );
}
