import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy — 8Rupia",
  description: `How ${SITE.name} collects, uses, stores and protects your personal information. Our complete privacy policy covering data collection, cookies, third-party services, retention and your rights.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="container pt-12 md:pt-16 pb-20 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        Privacy <span className="gradient-text">policy</span>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: May 2026</p>
      <p className="mt-4 text-lg text-muted-foreground">
        This policy explains what personal information {SITE.name} collects, how we use it, who
        we share it with, how long we keep it, and the choices you have over it. Plain English
        first, legal language second.
      </p>

      <div className="mt-10 prose prose-invert max-w-none text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold">1. The short version</h2>
        <p>
          We collect only the information we need to run the platform: your account details, what
          you do on the platform, and the bare minimum technical data to operate the service
          reliably. We do not sell your personal data to anyone. We do not pass your contact
          information to advertisers or unrelated third parties. We do not share your test
          scores, attempt history or weakness reports with anyone outside our authorised
          processors, and never publicly. You can delete your account and have all your personal
          data removed at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-10">2. What we collect, and why</h2>
        <p>
          <strong>Account information.</strong> When you create an account, we collect a unique
          identifier (email address or phone number), a password (stored as a salted hash, never
          in plain text), an optional name and the language you prefer. This information is
          needed to identify you, secure your account and personalise your experience.
        </p>
        <p>
          <strong>Activity and learning data.</strong> When you take a mock test, we record which
          questions you saw, what answers you selected, how long you spent on each question,
          whether you flagged or skipped any, and the final scored outcome. We also record
          attempts of the AI doubt solver and AI predicted-set generator. This activity history
          powers your dashboard, your weakness analyser and your study planner. It is never
          shown publicly.
        </p>
        <p>
          <strong>Payment information.</strong> When you make a payment, our payment processor
          (Razorpay) collects the card or UPI information directly. We see the transaction
          identifier, the amount, the result and the masked last four digits — we do not see or
          store full card numbers, CVVs, UPI PINs or net-banking passwords. Refunds, when
          applicable, are routed back through the same processor to your original payment
          method.
        </p>
        <p>
          <strong>Technical information.</strong> Like every modern web service, we record some
          technical data needed to operate the site: the IP address your request came from, the
          browser and device type, the URL of the page, the timestamp and the response code.
          This information is used to debug errors, protect the service against abuse (for
          example, scripted account creation or brute-force login attempts) and to size our
          infrastructure. We do not use it to track you across other websites.
        </p>
        <p>
          <strong>Cookies and similar technologies.</strong> We use first-party cookies to keep
          you logged in (session token), to remember your language preference and to record your
          consent for non-essential cookies. We also use limited analytics cookies to understand
          which pages are visited, which features are used and where users drop off in flows.
          These analytics are aggregated and do not identify individual users. You can disable
          non-essential cookies in your browser settings without losing core functionality.
        </p>

        <h2 className="text-2xl font-semibold mt-10">3. How we use your information</h2>
        <p>
          We use the information we collect to do three categories of things: (a) deliver the
          service you signed up for — show you mocks, score them, generate plans, answer doubts;
          (b) keep the service safe and reliable — detect abuse, prevent fraud, debug bugs,
          recover lost passwords; and (c) communicate with you about your account — confirmation
          emails for payments, password reset emails, replies to support queries and important
          service notices (for example, an outage or a policy change). We do not use your
          information for marketing emails unless you have explicitly opted in to such
          communications.
        </p>

        <h2 className="text-2xl font-semibold mt-10">4. Who we share information with</h2>
        <p>
          We share personal data only with carefully selected processors that help us run the
          platform, and only the minimum data they need to do their job. Our current processors
          include: (i) a managed cloud database provider where account, attempt and payment
          records are stored, (ii) Razorpay for payment processing, (iii) email-delivery
          services for transactional mail such as password resets, and (iv) AI model providers
          we use to generate questions, translate content and answer doubts. None of these
          processors are allowed to use your data for their own marketing purposes; their use is
          strictly limited to providing the service to us.
        </p>
        <p>
          We do not sell your personal information to data brokers or marketers, and we do not
          share it with advertisers. We may be required to disclose information in response to a
          valid legal request from a competent authority — for example, a court order or a
          formally served notice from law enforcement. We will challenge requests that we
          believe are overly broad or improperly authorised, and we will, where lawful, notify
          the affected user.
        </p>

        <h2 className="text-2xl font-semibold mt-10">5. How long we keep your data</h2>
        <p>
          We retain account information for as long as your account is active, and then for a
          short additional period if there is a legal or operational need (for example, tax law
          requires us to retain payment records for several years). Activity data is retained to
          power your dashboard and history view; if you delete your account, the personal
          identifiers are removed, and the activity data is either deleted or fully anonymised
          so that it can no longer be linked to you.
        </p>

        <h2 className="text-2xl font-semibold mt-10">6. How we protect your data</h2>
        <p>
          Passwords are stored as bcrypt hashes with a unique salt per user, never as plain
          text. Authentication uses signed JWT session cookies that are HTTP-only and marked
          secure in production. Communication between your browser and our servers is encrypted
          in transit (TLS). Access to production data by our team is restricted to a small
          number of senior engineers, controlled by individual credentials and audited. We run
          ongoing security reviews and welcome responsible disclosure of vulnerabilities — see
          our <Link href="/contact" className="text-brand-500">contact page</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10">7. Your rights</h2>
        <p>
          You have the right to access, update or delete your personal information at any time.
          Most of these actions are self-service from your account settings: update your name,
          change your password, change your preferred language, or delete your account. For
          anything you cannot complete yourself — for example, a request to export your full
          attempt history — write to us and we will fulfil the request within a reasonable time,
          typically within seven days. We will verify your identity before fulfilling deletion
          and export requests to protect your account against impersonation.
        </p>

        <h2 className="text-2xl font-semibold mt-10">8. Children and minors</h2>
        <p>
          {SITE.name} is built for school and post-school students, including students under the
          age of eighteen. Where a minor uses our platform, we recommend that a parent or
          guardian is aware of the account. We do not knowingly collect information from
          children under thirteen. If you believe that a child under thirteen has provided
          personal information to us, please contact us so that we can remove the account.
        </p>

        <h2 className="text-2xl font-semibold mt-10">9. Cross-border transfers</h2>
        <p>
          Our primary infrastructure is located within India. Some processors (for example, the
          AI model providers) may process data in other jurisdictions. Where this happens, we
          rely on contractual safeguards that require the processor to provide a level of
          protection comparable to Indian privacy law.
        </p>

        <h2 className="text-2xl font-semibold mt-10">10. Changes to this policy</h2>
        <p>
          We will update this policy from time to time as the platform evolves. Material changes
          will be announced on the home page and by email to active subscribers. The "Last
          updated" date at the top of this page reflects the most recent revision. By continuing
          to use the platform after a change, you agree to the revised policy.
        </p>

        <h2 className="text-2xl font-semibold mt-10">11. Contact</h2>
        <p>
          Questions about this policy or about your personal data can be sent to{" "}
          <a href={`mailto:${SITE.email}`} className="text-brand-500">{SITE.email}</a>. Please
          include enough information for us to identify your account and the specific question
          or request.
        </p>
      </div>
    </article>
  );
}
