import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="container py-24 max-w-md">
      <div className="glass rounded-2xl p-7 gradient-border text-center">
        <div className="flex justify-center mb-3"><Logo size="lg" href={null} /></div>
        <Compass className="h-8 w-8 mx-auto text-brand-500" />
        <h1 className="mt-3 font-display text-3xl font-bold">404 — page lost</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for moved or never existed. Let's get you back on track.
        </p>
        <div className="mt-5 flex justify-center gap-2 flex-wrap">
          <Link href="/"><Button>Home</Button></Link>
          <Link href="/exams"><Button variant="outline">Browse exams</Button></Link>
          <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}
