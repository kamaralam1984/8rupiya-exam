import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service — 8Rupia",
  description: `The terms and conditions that govern your use of ${SITE.name}: account rules, acceptable use, payments, intellectual property, liability and dispute resolution.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="container pt-12 md:pt-16 pb-20 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        Terms of <span className="gradient-text">service</span>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: May 2026</p>
      <p className="mt-4 text-lg text-muted-foreground">
        These terms govern your use of {SITE.name}. They explain what we promise to do, what you
        agree to in return and what happens if something goes wrong. Please read them — by using
        the service you accept them.
      </p>

      <div className="mt-10 prose prose-invert max-w-none text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold">1. Who we are</h2>
        <p>
          {SITE.name} is an AI-powered exam preparation platform operated for Indian students.
          References in these terms to "we", "us" or "our" refer to {SITE.name} and any affiliated
          entity that operates the service. References to "you" or "your" refer to the individual
          who has created an account, or, in the case of institutional plans, to the institution
          and its authorised users.
        </p>

        <h2 className="text-2xl font-semibold mt-10">2. Eligibility and account</h2>
        <p>
          You may use the service if you are at least thirteen years old. Users between thirteen
          and eighteen should use the platform with the awareness and, where required by local
          law, the consent of a parent or guardian. To use most features you need an account.
          When you create one, you agree to provide accurate information (a working email or
          phone number), to keep your login credentials confidential and to be responsible for
          all activity that happens under your account.
        </p>
        <p>
          You may not impersonate another person, create an account using credentials you are
          not authorised to use, or hold more than one personal account at a time. If you
          believe your account has been compromised, please change your password immediately and
          contact us.
        </p>

        <h2 className="text-2xl font-semibold mt-10">3. Acceptable use</h2>
        <p>
          The service is provided for legitimate educational use. You agree not to use it to
          (a) infringe the intellectual property rights of any party; (b) attempt to gain
          unauthorised access to our systems or to another user&apos;s account; (c) interfere with
          the operation of the service, including by automated scraping, denial-of-service
          attacks or excessive automated requests; (d) post, share or transmit content that is
          illegal, defamatory, harassing, hateful, sexually explicit, fraudulent or otherwise
          harmful; or (e) attempt to extract, mirror or republish substantial portions of the
          question bank, blog content or other proprietary material for resale or competitive
          purposes.
        </p>
        <p>
          We rely on rate limits, automated fraud detection and human review to keep the service
          fair for everyone. Repeated violations or particularly egregious single violations may
          result in suspension or termination of your account without prior notice. Where
          appropriate, we will report violations to law enforcement.
        </p>

        <h2 className="text-2xl font-semibold mt-10">4. Payments, refunds and subscriptions</h2>
        <p>
          Prices, plans and refund terms are described on our{" "}
          <Link href="/pricing" className="text-brand-500">pricing page</Link> and are part of
          this agreement. All payments are processed through a third-party payment provider; we
          do not see or store your card or bank credentials. By paying, you authorise the charge
          on the payment instrument you provided. Subscriptions automatically renew at the end
          of each billing cycle unless cancelled from your account settings. Cancellation stops
          the next renewal; access continues until the end of the period you have already paid
          for.
        </p>
        <p>
          We may change subscription prices over time. Existing subscribers keep their current
          price for the remainder of the period they have paid for; any change to their renewal
          price will be communicated by email before it takes effect, with enough notice to
          cancel if they prefer.
        </p>

        <h2 className="text-2xl font-semibold mt-10">5. Intellectual property</h2>
        <p>
          The platform, including its source code, design, brand, original content, AI-generated
          content produced by our systems and the structure of the question bank, is owned by
          {SITE.name} or licensed to us. You receive a limited, personal, non-transferable
          license to use this content for your own learning. You may not republish, mirror or
          re-sell our content. You may share short excerpts on study groups and social media so
          long as the source is clearly attributed and not used for competing commercial
          purposes.
        </p>
        <p>
          When you submit content to the platform (for example, a doubt question, an image
          attached to a doubt, or a feedback comment), you grant us a worldwide,
          royalty-free license to store, process and use that content as necessary to operate
          the service and improve it. You retain ownership of your content; you can request
          deletion at any time as described in our
          <Link href="/privacy" className="text-brand-500"> privacy policy</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10">6. Educational nature of content</h2>
        <p>
          All AI-generated questions, predicted sets, weakness reports, study plans and doubt
          responses are educational study aids and are not guarantees of exam outcomes. Coaching
          and practice can improve your performance, but no platform can guarantee selection,
          rank or score. Please read our{" "}
          <Link href="/disclaimer" className="text-brand-500">disclaimer</Link> for a fuller
          explanation of the educational-aid nature of our content.
        </p>

        <h2 className="text-2xl font-semibold mt-10">7. Third-party services</h2>
        <p>
          The platform integrates with third-party services such as payment processors, email
          delivery providers and AI model providers. Where the service depends on a third-party
          provider, we are responsible for choosing the provider with reasonable care, but we
          are not responsible for the third-party&apos;s own service outages, internal policies
          or pricing changes. Links from our platform to external websites are provided for
          convenience; we do not control or endorse those websites.
        </p>

        <h2 className="text-2xl font-semibold mt-10">8. Disclaimer of warranties</h2>
        <p>
          The service is provided on an "as is" and "as available" basis. To the maximum extent
          permitted by law, we disclaim all implied warranties, including merchantability,
          fitness for a particular purpose and non-infringement. We do not warrant that the
          service will be uninterrupted, error-free, completely secure or free of harmful
          components.
        </p>

        <h2 className="text-2xl font-semibold mt-10">9. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, our aggregate liability arising out of or
          related to your use of the service is limited to the amount you paid us in the
          twelve months preceding the event giving rise to the claim, or one thousand rupees,
          whichever is greater. We are not liable for indirect, consequential, incidental,
          punitive or special damages, including lost profits, lost data, lost opportunity or
          missed exam outcomes.
        </p>

        <h2 className="text-2xl font-semibold mt-10">10. Indemnity</h2>
        <p>
          You agree to indemnify and hold us harmless from any claim brought by a third party
          arising out of (a) your breach of these terms, (b) your misuse of the service or
          (c) your violation of any law or the rights of a third party. We will provide
          reasonable cooperation, at your expense, in defending any such claim.
        </p>

        <h2 className="text-2xl font-semibold mt-10">11. Termination</h2>
        <p>
          You may stop using the service at any time and delete your account from settings. We
          may suspend or terminate your access if you breach these terms, if your use endangers
          the service or other users, or if continued provision becomes commercially impractical.
          Provisions that, by their nature, should survive termination — including intellectual
          property, disclaimers, limitation of liability and dispute resolution — will continue
          to apply.
        </p>

        <h2 className="text-2xl font-semibold mt-10">12. Governing law and disputes</h2>
        <p>
          These terms are governed by the laws of India. Any dispute arising out of or related
          to these terms or your use of the service will be subject to the exclusive
          jurisdiction of the competent courts in India. Before initiating any formal dispute,
          we encourage you to reach out via the
          <Link href="/contact" className="text-brand-500"> contact page</Link>; most matters
          are resolved through good-faith discussion.
        </p>

        <h2 className="text-2xl font-semibold mt-10">13. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Material updates will be announced on the
          home page and, for active subscribers, by email. By continuing to use the service
          after an update, you accept the revised terms. If you disagree with a change, you may
          delete your account before the new terms take effect.
        </p>

        <p className="text-xs">
          Read also our <Link href="/privacy" className="text-brand-500">privacy policy</Link>,
          <Link href="/disclaimer" className="text-brand-500"> disclaimer</Link> and the
          <Link href="/contact" className="text-brand-500"> contact</Link> page.
        </p>
      </div>
    </article>
  );
}
