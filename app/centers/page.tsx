import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Wifi, BookOpen, Users, Sparkles, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline Study Centers",
  description:
    "8Rupia partner offline study centers across India — Wi-Fi, mentor support, mock test seats and ₹8 access.",
  alternates: { canonical: "/centers" },
};

type Center = {
  city: string;
  area: string;
  state: string;
  type: "Flagship" | "Partner";
  seats: number;
  hours: string;
  phone: string;
  gradient: string;
};

const CENTERS: Center[] = [
  { city: "Patna", area: "Boring Road", state: "Bihar", type: "Flagship", seats: 240, hours: "6 AM – 11 PM", phone: "+91 84xxx 22xxx", gradient: "from-rose-500 to-pink-600" },
  { city: "Lucknow", area: "Hazratganj", state: "UP", type: "Flagship", seats: 180, hours: "6 AM – 11 PM", phone: "+91 95xxx 41xxx", gradient: "from-indigo-500 to-purple-600" },
  { city: "Indore", area: "Vijay Nagar", state: "MP", type: "Partner", seats: 120, hours: "7 AM – 10 PM", phone: "+91 78xxx 91xxx", gradient: "from-cyan-500 to-blue-600" },
  { city: "Kota", area: "Talwandi", state: "Rajasthan", type: "Flagship", seats: 320, hours: "5 AM – 12 AM", phone: "+91 90xxx 12xxx", gradient: "from-emerald-500 to-teal-600" },
  { city: "Delhi", area: "Mukherjee Nagar", state: "Delhi", type: "Flagship", seats: 280, hours: "5 AM – 12 AM", phone: "+91 98xxx 87xxx", gradient: "from-amber-500 to-orange-600" },
  { city: "Hyderabad", area: "Ameerpet", state: "Telangana", type: "Partner", seats: 140, hours: "7 AM – 10 PM", phone: "+91 70xxx 33xxx", gradient: "from-purple-500 to-fuchsia-600" },
  { city: "Pune", area: "Karve Nagar", state: "Maharashtra", type: "Partner", seats: 110, hours: "7 AM – 10 PM", phone: "+91 88xxx 55xxx", gradient: "from-violet-500 to-indigo-600" },
  { city: "Bhopal", area: "MP Nagar", state: "MP", type: "Partner", seats: 95, hours: "7 AM – 10 PM", phone: "+91 89xxx 17xxx", gradient: "from-yellow-500 to-amber-600" },
];

export default function CentersPage() {
  return (
    <section className="container pt-10 pb-20 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Offline centers</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          Study <span className="ai-gradient-text">offline</span>, with 8Rupia
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Mehnat akele nahi karni. Flagship aur partner centers across India — Wi-Fi, mentor support,
          mock test seats aur silent reading zones. ₹8 wallet pe access.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CENTERS.map((c) => (
          <div key={`${c.city}-${c.area}`} className="neon-card p-5">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold">{c.city}</h3>
                <p className="text-xs text-muted-foreground">{c.area} · {c.state}</p>
              </div>
              <span className={`ai-chip text-[10px] ${c.type === "Flagship" ? "text-amber-300" : ""}`}>
                {c.type}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <Cell icon={Users} label="Seats" value={String(c.seats)} />
              <Cell icon={BookOpen} label="Hours" value={c.hours} />
              <Cell icon={Wifi} label="Wi-Fi" value="100 Mbps" />
            </div>

            <a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="mt-4 inline-flex items-center gap-1.5 text-xs text-brand-500 hover:underline">
              <Phone className="h-3 w-3" /> {c.phone}
            </a>
          </div>
        ))}
      </div>

      <div className="mt-12 neon-card p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 text-center">
        <Sparkles className="h-7 w-7 mx-auto text-purple-300" />
        <h2 className="mt-3 font-display text-2xl font-bold">Apne sheher mein center kholo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Partner program ke liye apply karo — full digital tooling + branding support.
        </p>
        <div className="mt-5 flex justify-center gap-3 flex-wrap">
          <Link href="/contact" className="btn-ai">Apply for partnership <ArrowUpRight className="h-3 w-3" /></Link>
          <Link href="/about" className="btn-ghost-ai">About 8Rupia</Link>
        </div>
      </div>
    </section>
  );
}

function Cell({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</p>
      <p className="font-display font-bold text-xs ai-gradient-text-cyan">{value}</p>
    </div>
  );
}
