import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — ₹8 Mock Tests, Monthly Subscriptions and School Plans",
  description:
    "Affordable AI exam prep — pay just ₹8 per premium mock test, or subscribe monthly for unlimited tests, AI analytics, study planner and doubt solver. Full pricing details, FAQs and refund policy.",
  alternates: { canonical: "/pricing" },
};

const PLANS = [
  {
    name: "Pay-per-Test",
    price: "₹8",
    sub: "per premium mock",
    features: [
      "1 premium AI mock test",
      "Detailed analytics report",
      "AI weakness analysis",
      "Personalized study tip",
    ],
    cta: "Unlock ₹8 Test",
  },
  {
    name: "Smart Monthly",
    price: "₹199",
    sub: "/ month",
    highlight: true,
    features: [
      "Unlimited premium mocks",
      "AI prediction sets for all exams",
      "Daily AI study plan",
      "AI doubt solver (Hindi + English)",
      "Voice tutor audio explanations",
    ],
    cta: "Start Monthly",
  },
  {
    name: "Exam Pro",
    price: "₹499",
    sub: "/ 6 months",
    features: [
      "Everything in Smart Monthly",
      "Priority support",
      "Advanced exam radar",
      "Downloadable revision notes",
    ],
    cta: "Go Pro",
  },
];

export default function PricingPage() {
  return (
    <section className="container pt-12 md:pt-16 pb-20">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Simple <span className="gradient-text">student pricing</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Start at the cost of a chai. Cancel any time. All plans include UPI payment, secure
          authentication and full Hindi and English support.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`glass rounded-2xl p-7 gradient-border ${
              p.highlight ? "ring-2 ring-brand-500/40 scale-[1.02]" : ""
            }`}
          >
            {p.highlight && (
              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent text-white mb-3">
                Most popular
              </span>
            )}
            <h3 className="font-display font-bold text-xl">{p.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">{p.price}</span>
              <span className="text-sm text-muted-foreground">{p.sub}</span>
            </div>
            <ul className="mt-5 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-6 w-full" variant={p.highlight ? "default" : "outline"}>
              {p.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-3xl prose prose-invert text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold">Why our pricing looks like this</h2>
        <p>
          The most common question we receive about pricing is the simplest one: <em>why eight
          rupees?</em> The honest answer is that we worked backwards from the wallet of the
          student we wanted to reach. A typical small-town student we spoke to during the early
          days of building 8Rupia could comfortably spend on a chai or a packet of biscuits
          without thinking twice. They could not comfortably spend on a four-hundred-rupee mock
          test, no matter how good. So we sized the smallest paid unit at the cost of a chai, and
          then engineered the platform so that this price could cover the AI inference, the
          payment processing fee and the bandwidth of running a complete premium mock.
        </p>
        <p>
          Pay-per-test is for the student who wants to try the platform with no commitment, and
          for the student who only needs one or two serious mocks before their exam. The monthly
          subscription is for the student who is in active preparation and will take multiple
          mocks every week. The six-month Exam Pro plan is for serious aspirants who want a
          steady, planned attack on their target exam — usually State PSC, SSC CGL or Banking
          aspirants who have decided this is their year.
        </p>

        <h2 className="text-2xl font-semibold mt-10">What is included in every plan</h2>
        <p>
          A few things are <strong>always free</strong> on the platform: account creation,
          browsing the catalogue of exams, reading our blog and strategy posts, taking free
          sample mocks shared on each exam page, viewing your dashboard and analytics for free
          attempts, and using the AI doubt solver up to a fair daily limit. Paid plans add deeper
          analytics, unlimited paid mocks, predicted question sets and Hindi translation of
          questions on demand.
        </p>
        <p>
          Every paid feature is also wrapped in a fair-use policy. We do not throttle, hide
          features behind dark patterns or sneak surprise upgrades. If you spend eight rupees on a
          mock, you get the complete mock with the complete analytics report — there is no
          mini-paywall in the middle.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Refund and cancellation policy</h2>
        <p>
          For pay-per-test unlocks, refunds are issued in two situations: a technical failure on
          our side that prevented you from completing or submitting the test, and a duplicate
          payment for the same test. To request a refund, write to our support email within seven
          days of the payment with the transaction reference. Approved refunds reach your
          original payment instrument within five to seven business days.
        </p>
        <p>
          Monthly and six-month subscriptions can be cancelled at any time from your account
          settings. Cancellation stops the next billing cycle; access continues until the current
          paid period ends. We do not pro-rate refunds for unused days inside an already-paid
          subscription period, but you keep access for those days.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Payment methods we accept</h2>
        <p>
          All major UPI apps (Google Pay, PhonePe, Paytm UPI, BHIM and bank UPI apps), debit and
          credit cards from Indian and international issuers, and net-banking from major Indian
          banks. Payments are processed through Razorpay&apos;s PCI-DSS compliant infrastructure;
          we never see or store full card numbers, UPI PINs or CVVs. Receipts are emailed
          automatically after each successful payment.
        </p>

        <h2 className="text-2xl font-semibold mt-10">School and bulk pricing</h2>
        <p>
          Schools, coaching centres, NGOs and student unions can buy bundles of unlocks at a
          steep discount to the per-test rate. Bundle sizes start at fifty unlocks and scale to
          tens of thousands. Bulk plans include a shared dashboard for the institution&apos;s
          administrator, batch unlocks of test sets across a cohort and an aggregated weakness
          report that helps teachers see where the cohort needs intervention. Bulk inquiries go
          to our <Link href="/contact" className="text-brand-500">contact page</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Frequently asked questions</h2>
        <p>
          <strong>Is GST included in the price?</strong> Yes. All prices on this page are
          inclusive of applicable taxes. A GST invoice is available on request for institutional
          purchases.
        </p>
        <p>
          <strong>Do you charge per device?</strong> No. Your subscription is tied to your
          account, not your device. You can sign in on your phone, your laptop and a borrowed
          family tablet — your mocks, history and analytics follow you across devices.
        </p>
        <p>
          <strong>What happens to my data if I stop subscribing?</strong> Your account stays
          open. You keep view-access to every mock you took, your dashboard history and any
          downloaded plans. Paid features (new premium mocks, AI prediction set generation,
          unlimited doubt solver) pause until you renew. You can re-subscribe any time without
          re-paying for the past.
        </p>
        <p>
          <strong>Can I share my subscription with a friend?</strong> Sharing your login goes
          against our fair-use policy and triggers automatic security holds (for example,
          simultaneous sessions from very distant locations). We would rather you both create
          individual accounts and use the eight-rupee unlocks. If price is the blocker for the
          second friend, contact us — we run scholarship credits for verified financial-need
          cases.
        </p>
        <p>
          <strong>Will the price ever go up?</strong> The eight-rupee per-mock unlock will not
          change. That is the founding promise of the platform. Subscription prices may adjust
          over time as we add more features (for example, voice tutors and richer prediction
          analytics), but every existing subscriber keeps their original price for the life of
          their current subscription cycle.
        </p>

        <p className="text-xs">
          See our <Link href="/terms" className="text-brand-500">terms of service</Link>,
          <Link href="/privacy" className="text-brand-500"> privacy policy</Link> and
          <Link href="/disclaimer" className="text-brand-500"> disclaimer</Link> for the legal
          details.
        </p>
      </div>
    </section>
  );
}
