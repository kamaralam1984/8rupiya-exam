import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  /** Kept for backward compat. The brand image already contains the text. */
  text?: boolean;
  href?: string | null;
  className?: string;
  /** Kept for backward compat; ignored when rendering the brand image. */
  textClassName?: string;
};

const HEIGHTS: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 28,
  md: 36,
  lg: 56,
  xl: 88,
};

// Source image aspect ratio (1536 x 1024 -> ~1.5)
const ASPECT = 1536 / 1024;

function BrandMark({ size = "md", className }: { size?: NonNullable<LogoProps["size"]>; className?: string }) {
  const h = HEIGHTS[size];
  const w = Math.round(h * ASPECT);
  return (
    <Image
      src="/brand-logo.png"
      alt="8rupiya — Smart Exam Practice"
      width={w}
      height={h}
      priority={size === "xl" || size === "lg"}
      className={cn("block h-auto w-auto select-none", className)}
      style={{ height: h, width: "auto" }}
    />
  );
}

export function Logo({
  size = "md",
  href = "/",
  className,
}: LogoProps) {
  const mark = <BrandMark size={size} className={className} />;
  if (!href) return mark;
  return (
    <Link href={href} aria-label="8rupiya home" className="inline-flex items-center shrink-0">
      {mark}
    </Link>
  );
}

export { BrandMark as LogoMark };
