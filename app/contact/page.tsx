import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/utils";
import { Mail, MapPin, Clock, MessageCircle, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact 8Rupia — Support, Partnerships and Feedback",
  description: `Get in touch with the ${SITE.name} team for support, partnerships, feedback, billing questions or school programs. We typically respond within 24 hours.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="container pt-12 md:pt-16 pb-20 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        Contact <span className="gradient-text">us</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Questions, feedback, billing problems or partnership ideas — we read every message and
        typically reply within twenty-four hours on weekdays.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 gradient-border">
          <Mail className="h-5 w-5 text-brand-500" />
          <p className="mt-2 text-sm text-muted-foreground">Email support</p>
          <a href={`mailto:${SITE.email}`} className="font-medium hover:underline">{SITE.email}</a>
        </div>
        <div className="glass rounded-2xl p-5 gradient-border">
          <Clock className="h-5 w-5 text-brand-500" />
          <p className="mt-2 text-sm text-muted-foreground">Response time</p>
          <p className="font-medium">Within 24 hours, Mon-Sat</p>
        </div>
        <div className="glass rounded-2xl p-5 gradient-border">
          <MapPin className="h-5 w-5 text-brand-500" />
          <p className="mt-2 text-sm text-muted-foreground">Location</p>
          <p className="font-medium">Remote-first team, headquartered in India</p>
        </div>
        <div className="glass rounded-2xl p-5 gradient-border">
          <Users className="h-5 w-5 text-brand-500" />
          <p className="mt-2 text-sm text-muted-foreground">Schools & coaching centres</p>
          <p className="font-medium">Mention <em>partnership</em> in your subject line</p>
        </div>
      </div>

      <div className="mt-10 prose prose-invert max-w-none text-muted-foreground space-y-6 prose-headings:text-foreground prose-headings:font-display prose-strong:text-foreground">
        <h2 className="text-2xl font-semibold">The right channel for the right question</h2>
        <p>
          Most student questions fall into one of five buckets, and picking the right channel
          gets you a faster answer. If your question is about an answer key, an explanation that
          seems wrong, or a glitch in a mock test, please use the small <strong>Report this
          question</strong> link visible inside each question. Reports go directly to the editorial
          queue rather than the inbox, and our reviewers usually respond within a working day.
        </p>
        <p>
          For billing and payment issues — failed UPI charges, duplicate deductions, unable to
          unlock a paid mock — email <a href={`mailto:${SITE.email}`} className="text-brand-500">
          {SITE.email}</a> with the subject line <em>Billing</em> and include the transaction
          reference from your bank or wallet. Bank statements with the date and last four digits
          of the transaction help us match the record. We do <strong>not</strong> ask for OTPs,
          full card numbers, UPI PINs or bank passwords at any time. If anyone claiming to be
          from {SITE.name} asks for these, please report the message and do not respond.
        </p>
        <p>
          For account-recovery questions — forgotten password, locked-out account, lost device
          with the only login session — start with the
          <Link href="/forgot-password" className="text-brand-500"> password reset</Link> flow. If
          the reset email does not arrive within ten minutes, write to us with the registered
          email address and we will help verify the account.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Partnerships and bulk programs</h2>
        <p>
          We work with coaching centres, schools, NGOs running scholarship programs and student
          unions that want to bring affordable preparation to their members. Bulk programs include
          shared dashboards for cohorts, batch unlocks of premium mocks, white-labelled question
          banks for institutional libraries and aggregated weakness reports for teachers. If you
          are running a program for fifty students or more, write to us with a short note
          describing your cohort size, target exams and timeline. We typically reply within a day
          with options.
        </p>
        <p>
          We are also open to content partnerships. Educators who write topic-wise explanations,
          past-paper analyses or strategy posts for our blog earn an honorarium per accepted post
          and full author attribution. If you would like to contribute, please share a writing
          sample or a link to your existing portfolio.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Press and media</h2>
        <p>
          For interviews, podcast invitations, panel discussions or company news, write with
          <em> Press</em> in the subject line. We are happy to share founding-team biographies,
          high-resolution logos, screenshot kits and exam-coverage figures for any honest editorial
          coverage of the affordable-EdTech space in India.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Reporting abuse or unsafe content</h2>
        <p>
          {SITE.name} is built for students, including students under the age of eighteen. If you
          see content on the site that you believe is inappropriate, harmful, biased or
          discriminatory, please report it directly with the <em>Report</em> link, or email us
          with a short description and a screenshot if possible. Reports are reviewed by a human
          on the same day. We take down content that violates our policies without waiting for a
          formal complaint.
        </p>
        <p>
          If you believe a question, image, document or excerpt on the platform infringes your
          copyright, please write to us under the subject line <em>Copyright Notice</em> with the
          URL of the page, a description of the original work, your relationship to the work
          (author, publisher, agent) and a brief statement that you have a good-faith belief that
          the use is unauthorised. We act on credible notices within seventy-two hours.
        </p>

        <h2 className="text-2xl font-semibold mt-10">What our support team cannot help with</h2>
        <p>
          We can fix payment glitches, correct answer keys, restore locked accounts and adjust
          subscriptions. There are a few things we genuinely cannot do, and saying so up front
          saves everyone time. We cannot share an upcoming exam paper or answer key — no
          legitimate platform can, and any service that offers such material is misleading you.
          We cannot guarantee that you will clear an exam or attain a particular rank; the most
          honest thing any preparation platform can do is improve your odds, and that is what
          our analytics and predicted sets aim for. We also cannot help with the official
          application process itself — registration, fees, admit card download, exam centre
          changes — because those are handled by the conducting authority on their own portal.
          For application-related issues, please reach the conducting body directly.
        </p>

        <h2 className="text-2xl font-semibold mt-10">Office hours and regional support</h2>
        <p>
          Our support team is reachable Monday through Saturday between 9 AM and 7 PM India
          Standard Time. Outside these hours, your email lands in the inbox and we pick it up
          the next morning. Replies are in English by default; if you prefer Hindi, please
          mention it at the top of your email and we will switch. For students in tier-3 towns
          and rural districts, we are happy to take questions by simple text-only email — no
          attachments, no formatting required.
        </p>

        <h2 className="text-2xl font-semibold mt-10">A note on response times</h2>
        <p>
          We are a small team supporting a fast-growing student base. Most days we answer within
          a few hours. Around board season — March, April and the run-up to major recruitment
          exams — we receive an unusual volume of mail, and a response can take up to forty-eight
          hours. If your matter is urgent (a failed payment that has blocked your test), please
          mark the subject line <em>Urgent — Billing</em> and we will move it to the front of the
          queue.
        </p>
        <p>
          We genuinely value student feedback. Most of the features visible on the site today were
          built because someone wrote in to say something was missing, confusing or wrong. Thank
          you for taking the time.
        </p>

        <p className="text-xs flex items-center gap-2 mt-8">
          <ShieldCheck className="h-4 w-4" />
          We will never ask for your password, OTP or UPI PIN.
        </p>
        <p className="text-xs flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Read more on our <Link href="/privacy" className="text-brand-500">privacy</Link> and
          <Link href="/terms" className="text-brand-500"> terms</Link> pages.
        </p>
      </div>
    </article>
  );
}
