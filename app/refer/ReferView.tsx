"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Copy, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Data = { code: string; link: string; referredCount: number; bonusPerSignup: number };

export function ReferView() {
  const [data, setData] = useState<Data | null>(null);
  const [needAuth, setNeedAuth] = useState(false);
  const toast = useToast();
  useEffect(() => {
    (async () => {
      const r = await api<Data>("/api/referrals/me");
      if (!r.ok) { if (r.error.code === "UNAUTHENTICATED") setNeedAuth(true); return; }
      setData(r.data);
    })();
  }, []);

  if (needAuth) {
    return (
      <section className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Sign in to view your referral code</h1>
          <Link href="/signin?next=/refer" className="mt-4 inline-block"><Button>Sign in</Button></Link>
        </div>
      </section>
    );
  }
  if (!data) return <section className="container py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></section>;

  function copy() {
    navigator.clipboard.writeText(data!.link);
    toast("Link copied", "success");
  }
  async function share() {
    if (!navigator.share) { copy(); return; }
    try {
      await navigator.share({ title: "8Rupia", text: `Join me on 8Rupia for ₹8 AI mock tests`, url: data!.link });
    } catch {/* ignore */}
  }

  return (
    <section className="container pt-10 pb-20 max-w-2xl">
      <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
        <Users className="h-7 w-7 text-brand-500" /> Refer & Earn
      </h1>
      <p className="mt-2 text-muted-foreground">
        Share your code. When a friend makes their first ₹8 unlock, you both get ₹{data.bonusPerSignup / 100} wallet credit.
      </p>

      <div className="mt-6 glass rounded-2xl p-6 gradient-border text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Your code</p>
        <p className="mt-2 font-display text-5xl font-bold gradient-text">{data.code}</p>
        <p className="mt-2 text-xs text-muted-foreground break-all">{data.link}</p>
        <div className="mt-5 flex gap-2 justify-center">
          <Button onClick={copy}><Copy className="h-4 w-4" /> Copy link</Button>
          <Button onClick={share} variant="outline"><Share2 className="h-4 w-4" /> Share</Button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Friends signed up</p>
          <p className="mt-1 font-display text-2xl font-bold">{data.referredCount}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Bonus per signup</p>
          <p className="mt-1 font-display text-2xl font-bold">₹{data.bonusPerSignup / 100}</p>
        </div>
      </div>
    </section>
  );
}
