import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your 8Rupia account to access AI-powered mock tests.",
  alternates: { canonical: "/signin" },
};

export default function SignInPage() {
  return (
    <section className="container pt-16 pb-20 max-w-md">
      <Suspense fallback={null}>
        <AuthForm mode="signin" />
      </Suspense>
    </section>
  );
}
