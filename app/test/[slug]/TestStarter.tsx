"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestRunner } from "@/components/test-runner";
import { RazorpayCheckout } from "@/components/razorpay-checkout";
import { api } from "@/lib/api-client";
import type { Question } from "@/components/question-card";

type StartResp = {
  attemptId: string;
  durationMin: number;
  questions: Question[];
  resumed: boolean;
};

type State =
  | { kind: "loading" }
  | { kind: "needs-auth" }
  | { kind: "needs-payment" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: StartResp };

export function TestStarter({ testSetSlug }: { testSetSlug: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [agreed, setAgreed] = useState(false);

  async function start() {
    setState({ kind: "loading" });
    const r = await api<StartResp>("/api/attempts/start", {
      method: "POST",
      body: JSON.stringify({ testSetSlug }),
    });
    if (r.ok) {
      setState({ kind: "ready", data: r.data });
      return;
    }
    if (r.error.code === "UNAUTHENTICATED") {
      setState({ kind: "needs-auth" });
      return;
    }
    if (r.error.code === "PAYMENT_REQUIRED") {
      setState({ kind: "needs-payment" });
      return;
    }
    setState({ kind: "error", message: r.error.message ?? r.error.code });
  }

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (state.kind === "needs-auth") {
    const next = encodeURIComponent(`/test/${testSetSlug}`);
    return (
      <div className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-2xl font-bold">Sign in to start</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an account to take this test. It only takes a moment.
          </p>
          <div className="mt-5 flex gap-2">
            <Link href={`/signin?next=${next}`}><Button>Sign in</Button></Link>
            <Link href={`/signup?next=${next}`}><Button variant="outline">Create account</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === "needs-payment") {
    return (
      <div className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-2xl font-bold">Premium mock — unlock for ₹8</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This test includes detailed analytics and an AI weakness report. Pay once,
            access it any time.
          </p>
          <div className="mt-5">
            <RazorpayCheckout
              testSetSlug={testSetSlug}
              onSuccess={() => {
                router.refresh();
                start();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Could not start test</h1>
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
          <div className="mt-4">
            <Button onClick={start}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // ready
  if (state.data.questions.length === 0) {
    return (
      <div className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">No questions yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This test set is published but doesn't have any questions linked yet. Please pick
            another exam or try again shortly.
          </p>
          <div className="mt-4">
            <Link href="/exams"><Button>Browse exams</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.data.resumed) {
    return (
      <TestRunner
        attemptId={state.data.attemptId}
        testSetSlug={testSetSlug}
        durationMin={state.data.durationMin}
        questions={state.data.questions}
      />
    );
  }

  if (!agreed) {
    return (
      <div className="container py-16 max-w-lg">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-2xl font-bold">Before you begin</h1>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Duration: <strong>{state.data.durationMin} minutes</strong></li>
            <li>Questions: <strong>{state.data.questions.length}</strong></li>
            <li>Each correct answer is rewarded; negative marking applies per question.</li>
            <li>Use the palette to navigate. Press <kbd>1</kbd>–<kbd>4</kbd> to select, <kbd>F</kbd> to flag, arrow keys to move.</li>
            <li>Do not refresh the tab — your progress is in-memory until submitted.</li>
          </ul>
          <div className="mt-5">
            <Button size="lg" onClick={() => setAgreed(true)}>Start test</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TestRunner
      attemptId={state.data.attemptId}
      testSetSlug={testSetSlug}
      durationMin={state.data.durationMin}
      questions={state.data.questions}
    />
  );
}
