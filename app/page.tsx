import { redirect } from "next/navigation";
import { HeroAI } from "@/components/hero-ai";
import { ExamGrid } from "@/components/exam-grid";
import { FeaturesAI } from "@/components/features-ai";
import { LiveClassesSection } from "@/components/live-classes-section";
import { GoluAISection } from "@/components/golu-ai-section";
import { GamificationSection } from "@/components/gamification-section";
import { AiControlCenter } from "@/components/ai-control-center";
import { SelectionShowcase } from "@/components/selection-showcase";
import { PricingAI } from "@/components/pricing-ai";
import { FinalCTA } from "@/components/final-cta";
import { HowItWorks } from "@/components/how-it-works";
import { SubjectRow } from "@/components/subject-row";
import { AppDownloadSection } from "@/components/app-download-section";
import { ScholarshipBanner } from "@/components/scholarship-banner";
import { PushOptIn } from "@/components/push-opt-in";
import { BatchLaunchSection } from "@/components/batch-launch-section";
import { YouTubeSection } from "@/components/youtube-section";
import { SITE } from "@/lib/utils";
import Link from "next/link";
import { readSession } from "@/lib/auth";
import { db } from "@/lib/db";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does ₹8 unlock on 8Rupia?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "A ₹8 unlock gives you access to a premium AI-curated mock test along with detailed analytics, an AI weakness report and a personalized study plan for that exam.",
      },
    },
    {
      "@type": "Question",
      name: "Which exams are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "8Rupia supports CTET, SSC (CGL/CHSL/MTS), Railway (RRB), Banking (IBPS/SBI), CUET, Class 10 Boards, NIIT NAT, State Police, Teacher TET and major State PSC exams.",
      },
    },
    {
      "@type": "Question",
      name: "Are predicted question sets actual paper leaks?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "No. Predicted sets are an educational study aid built by analyzing publicly available previous-year question papers for repeated topics, weightage and trends. They do not claim to reproduce any actual upcoming exam.",
      },
    },
    {
      "@type": "Question",
      name: "Is the platform available in Hindi?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. The interface, explanations, doubt solver and voice tutor all support both Hindi and English.",
      },
    },
  ],
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await readSession();
  if (session) {
    const user = await db.user.findUnique({
      where: { id: session.sub },
      select: { examTrack: true },
    });
    if (user) {
      redirect(user.examTrack ? "/home" : "/onboarding");
    }
  }
  return (
    <>
      <HeroAI />
      <ExamGrid />
      <FeaturesAI />
      <ScholarshipBanner />
      <BatchLaunchSection />
      <LiveClassesSection />
      <YouTubeSection />
      <GoluAISection />
      <AiControlCenter />
      <GamificationSection />
      <SelectionShowcase />
      <HowItWorks />
      <SubjectRow />
      <AppDownloadSection />
      <PricingAI />
      <FinalCTA />
      <PushOptIn />

      {/* What is 8Rupia — branded, SEO + AdSense friendly long-form section */}
      <section id="about-8rupia" className="container py-16 md:py-20 max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">
            About this website
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold tracking-tight">
            What is <span className="gradient-text">{SITE.name}</span>?
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            {SITE.name} is India&apos;s most affordable AI-powered exam preparation platform — built
            for students who want serious, modern coaching at the price of a chai. We combine
            calibrated mock tests, AI weakness analytics, smart study planners, a bilingual
            doubt solver and a previous-year question archive into a single, beautifully designed
            home for your prep.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          <div className="glass rounded-2xl p-6 gradient-border">
            <p className="text-3xl font-display font-bold gradient-text">₹8</p>
            <p className="mt-2 font-semibold">Per premium mock test</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The smallest paid unit on the platform — a complete mock with AI analytics for
              less than the cost of a chai.
            </p>
          </div>
          <div className="glass rounded-2xl p-6 gradient-border">
            <p className="text-3xl font-display font-bold gradient-text">10+</p>
            <p className="mt-2 font-semibold">Exam tracks covered</p>
            <p className="mt-1 text-sm text-muted-foreground">
              CTET, SSC, Railway, Banking, CUET, Class 10 Boards, NIIT, Police, Teacher TET and
              State PSC — each with its own calibrated dashboard.
            </p>
          </div>
          <div className="glass rounded-2xl p-6 gradient-border">
            <p className="text-3xl font-display font-bold gradient-text">2</p>
            <p className="mt-2 font-semibold">Languages, instantly</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every question, explanation and study plan is available in both Hindi and English
              with one-tap switching.
            </p>
          </div>
        </div>

        <div className="mt-14 prose prose-invert max-w-none text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
          <h3 className="text-2xl font-semibold">Why students choose {SITE.name}</h3>
          <p>
            Most exam preparation platforms in India ask a student to choose between two
            equally bad options: pay a few thousand rupees for a subscription that feels like a
            luxury, or stumble through hundreds of low-quality free PDFs on social-media groups.
            {SITE.name} was built to remove that trade-off. Our entire product is designed
            around a single working assumption: every student in this country deserves modern,
            data-driven coaching at a price that does not make them pause. The eight-rupee
            unlock is the foundation of that promise. It covers a complete, full-length premium
            mock test, the full AI analytics report on the attempt and a personalised study tip
            for what to do next. There is no mini-paywall, no upsell halfway through and no
            advertisement interrupting your test.
          </p>

          <h3 className="text-2xl font-semibold mt-10">The four pillars of our platform</h3>
          <p>
            <strong>Calibrated mock tests.</strong> Every test set on the platform mirrors the
            real exam pattern, difficulty curve and time budget. A CTET mock has 150 questions
            in 150 minutes with the official subject distribution. A Banking sectional mock has
            strict per-section timers like IBPS Mains. The point of a mock is to reduce
            exam-day surprises, and we treat that seriously.
          </p>
          <p>
            <strong>AI weakness analyser.</strong> After every attempt, the analyser combines
            accuracy, time-per-question, flagging behaviour and guess patterns to tell you
            exactly which chapters are pulling down your score. Instead of vague tips like
            &quot;practise more&quot;, you get specific actions: revise this topic for two days,
            attempt this drill tomorrow, watch out for this trap question.
          </p>
          <p>
            <strong>AI predicted question sets.</strong> Powered by previous-year question data
            from the last decade, our predicted sets rank topics by frequency, freshness and
            weightage. Each predicted question carries a confidence score from 0 to 100 so you
            know exactly how strong the historical pattern is. These are educational
            projections, not leaked papers — and we say that loudly on every page.
          </p>
          <p>
            <strong>AI doubt solver and study planner.</strong> Stuck on a problem? Paste the
            question, snap a photo, or type it out — the doubt solver replies with a step-by-step
            explanation in your chosen language. Need a thirty-day attack plan before your
            exam? The planner builds a daily schedule based on your free hours, your weak
            subjects and your target paper.
          </p>

          <h3 className="text-2xl font-semibold mt-10">The benefits, in plain language</h3>
          <p>
            <strong>It is genuinely affordable.</strong> Eight rupees for a premium mock is
            cheaper than a single sheet of photocopied test paper, and it includes the
            analytics report that a printed test never can. For active aspirants, the monthly
            and six-month subscriptions are priced in the same spirit — comparable to what a
            student spends on snacks during a single study weekend.
          </p>
          <p>
            <strong>It is bilingual by design.</strong> Hindi and English are first-class on the
            platform. Question stems, options, explanations, weakness reports, study plans and
            doubt-solver answers all switch with one tap. We do not bury the Hindi version
            inside an option menu and call it a day; it is the same depth and quality as
            English.
          </p>
          <p>
            <strong>It is built for the mobile-first student.</strong> Most of our users open
            the site on a phone, often on a slow data connection. The site is engineered for
            that: it loads quickly, works offline for cached content and installs as a
            Progressive Web App so it sits next to your other apps with one tap.
          </p>
          <p>
            <strong>It is honest about what AI can and cannot do.</strong> Our predicted
            confidence scores are conservative. Our weakness reports cite the data they were
            built on. Our doubt-solver answers are clearly labelled as AI-generated, with a
            visible report button so you can flag a mistake and we can fix it for the next
            student.
          </p>
          <p>
            <strong>It respects your time.</strong> The dashboard surfaces exactly the four or
            five things you should do next, not a wall of options. Quick actions, daily drills
            and a single signature feature per exam track keep the experience focused.
          </p>

          <h3 className="text-2xl font-semibold mt-10">Who this platform is for</h3>
          <p>
            We built {SITE.name} for the next hundred million Indian students who do not have
            easy access to coaching, but absolutely have the talent to clear competitive exams.
            That includes CTET aspirants preparing to become teachers, SSC and Railway
            aspirants targeting government jobs, banking aspirants writing IBPS and SBI papers,
            CUET candidates entering central universities, Class 10 board students chasing high
            scores, NIIT NAT applicants, State PSC aspirants writing BPSC, UPPSC, MPPSC and
            similar exams, and police constable and sub-inspector candidates. If your exam is
            on the list, our platform is calibrated for it. If it is not, our team is happy to
            consider adding it — write to us with the exam name and your target cycle.
          </p>

          <h3 className="text-2xl font-semibold mt-10">How {SITE.name} works in three steps</h3>
          <p>
            <strong>Step one.</strong> Create a free account in under a minute using your email
            or phone number. Pick the exam you are preparing for; the entire dashboard, the
            quick actions and the signature feature personalise to that track instantly.
          </p>
          <p>
            <strong>Step two.</strong> Start with a free sample mock to see how the platform
            feels. Read your weakness report. Decide whether to take a deeper premium mock
            (eight rupees), let the AI build a predicted set for you, or generate a thirty-day
            study plan.
          </p>
          <p>
            <strong>Step three.</strong> Make it a habit. The students who get the most out of
            {SITE.name} are the ones who treat it like a daily companion: a quick drill in the
            morning, one mock a week, a doubt or two when a chapter feels sticky. Compound
            interest applies to studying too.
          </p>

          <h3 className="text-2xl font-semibold mt-10">A promise about prices and academic integrity</h3>
          <p>
            We will never raise the eight-rupee unlock price. That is the founding promise of
            the platform. Subscription prices may evolve as we add features, but existing
            subscribers keep their current price through the end of their billing cycle, and
            the per-test unlock stays where it is. We also do not, and will not, claim to leak
            or sell exam papers — read our <Link href="/disclaimer" className="text-brand-500">
            disclaimer</Link> for the full position on academic integrity, predicted sets and
            fair use of previous-year questions.
          </p>

          <h3 className="text-2xl font-semibold mt-10">Ready to start?</h3>
          <p>
            Pick your exam from the catalogue above, take a free sample mock, and see for
            yourself why students from CTET, SSC, Railway, Banking, CUET, Class 10, NIIT,
            Police, Teacher TET and State PSC tracks call {SITE.name} the most useful eight
            rupees they spend on their prep. If you want to read more about who built this
            platform and why, head over to our <Link href="/about" className="text-brand-500">
            about page</Link>; for pricing details, see the <Link href="/pricing" className="text-brand-500">
            pricing page</Link>; and for our editorial standards and content philosophy, the
            <Link href="/blog" className="text-brand-500"> blog</Link> is a good starting point.
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="neon-card rounded-3xl p-8 md:p-12 text-center bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Start your <span className="ai-gradient-text">₹8 journey</span> today
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Join lakhs of students who use {SITE.name} to study smarter, not longer.
          </p>
          <div className="mt-7 flex justify-center gap-3 flex-wrap">
            <Link href="/exams" className="btn-ai">Explore Exams</Link>
            <Link href="/pricing" className="btn-ghost-ai">See Pricing</Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
