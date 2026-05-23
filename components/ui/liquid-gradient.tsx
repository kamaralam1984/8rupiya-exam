"use client";

/**
 * Soft liquid gradient blob background — SVG with animated blur + morph.
 * Pure CSS animations (no rAF), respects prefers-reduced-motion via Tailwind.
 */
export function LiquidGradient({
  className = "",
  opacity = 0.35,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 800 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="lg-a" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={opacity} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lg-b" cx="70%" cy="70%" r="55%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={opacity} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lg-c" cx="50%" cy="20%" r="40%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={opacity} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <filter id="lg-blur"><feGaussianBlur stdDeviation="60" /></filter>
        </defs>
        <g filter="url(#lg-blur)">
          <circle cx="240" cy="200" r="220" fill="url(#lg-a)">
            <animate attributeName="cx" values="240;420;200;240" dur="22s" repeatCount="indefinite" />
            <animate attributeName="cy" values="200;320;240;200" dur="18s" repeatCount="indefinite" />
          </circle>
          <circle cx="560" cy="420" r="240" fill="url(#lg-b)">
            <animate attributeName="cx" values="560;380;620;560" dur="26s" repeatCount="indefinite" />
            <animate attributeName="cy" values="420;280;460;420" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="120" r="180" fill="url(#lg-c)">
            <animate attributeName="cx" values="400;240;520;400" dur="24s" repeatCount="indefinite" />
            <animate attributeName="cy" values="120;240;100;120" dur="22s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
