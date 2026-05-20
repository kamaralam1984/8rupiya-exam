import { Suspense } from "react";
import { ResetForm } from "./ResetForm";

export default function ResetPage() {
  return (
    <section className="container pt-16 pb-20 max-w-md">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </section>
  );
}
