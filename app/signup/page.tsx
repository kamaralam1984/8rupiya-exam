import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free 8Rupia account.",
  alternates: { canonical: "/signup" },
};

export default function SignUpPage() {
  return (
    <section className="container pt-16 pb-20 max-w-md">
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </section>
  );
}
