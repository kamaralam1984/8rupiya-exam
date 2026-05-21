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

// Navbar/header logo uses a tighter crop (10% top + 10% bottom removed from the
// 1536x1024 master → 1536x819, aspect ≈ 1.875). Hero keeps /brand-logo.png
// independent so each can be tuned without affecting the other.
const NAV_LOGO_SRC = "/brand-logo-nav.png";
const NAV_ASPECT = 1536 / 819;

function BrandMark({ size = "md", className }: { size?: NonNullable<LogoProps["size"]>; className?: string }) {
  const h = HEIGHTS[size];
  const w = Math.round(h * NAV_ASPECT);
  return (
    <Image
      src={NAV_LOGO_SRC}
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
