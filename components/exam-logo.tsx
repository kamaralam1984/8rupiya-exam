import {
  GraduationCap,
  Briefcase,
  TrainFront,
  Landmark,
  Building2,
  School,
  Code2,
  ShieldCheck,
  PencilLine,
  Library,
  Stethoscope,
  BookOpen,
} from "lucide-react";
import type { ExamIconKey } from "@/lib/exams";
import { cn } from "@/lib/utils";

const ICONS: Record<ExamIconKey, React.ComponentType<{ className?: string }>> = {
  graduation: GraduationCap,
  briefcase: Briefcase,
  train: TrainFront,
  bank: Building2,
  university: Library,
  school: School,
  code: Code2,
  shield: ShieldCheck,
  pencil: PencilLine,
  landmark: Landmark,
  stethoscope: Stethoscope,
  book: BookOpen,
};

type Props = {
  icon?: ExamIconKey;
  color?: string; // tailwind gradient classes, e.g. "from-purple-500 to-fuchsia-500"
  logoUrl?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE: Record<NonNullable<Props["size"]>, { box: string; icon: string }> = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-14 w-14", icon: "h-7 w-7" },
  xl: { box: "h-[120px] w-[120px]", icon: "h-14 w-14" },
};

/**
 * Renders an exam course "logo" — uses a real <img> when `logoUrl` is provided
 * (e.g. /exam-logos/ctet.png), otherwise falls back to a colored Lucide icon
 * so every card has a distinct, recognisable badge.
 */
export function ExamLogo({
  icon = "book",
  color = "from-brand-500 to-accent",
  logoUrl,
  alt,
  size = "md",
  className,
}: Props) {
  const sz = SIZE[size];
  if (logoUrl) {
    // Exam crests come in different shapes — circular (CTET/NEET), shield (Class 10),
    // shield with banners (SSC). object-contain keeps the FULL logo visible; scale-140
    // makes it visually 40% larger inside the round container while overflow-hidden
    // crops any spillover cleanly to the circle edge.
    return (
      <span
        className={cn(
          "grid place-items-center rounded-full overflow-hidden shrink-0 ring-1 ring-border/60 bg-white/40 dark:bg-white/5",
          sz.box,
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={alt} className="h-full w-full object-contain scale-[1.4]" />
      </span>
    );
  }
  const Icon = ICONS[icon] ?? BookOpen;
  return (
    <span
      className={cn(
        "grid place-items-center rounded-lg text-white shadow-sm bg-gradient-to-br shrink-0",
        color,
        sz.box,
        className,
      )}
      aria-label={alt}
    >
      <Icon className={sz.icon} />
    </span>
  );
}
