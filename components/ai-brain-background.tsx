"use client";

/**
 * Animated AI "brain" SVG — neural nodes + animated connections.
 * Decorative only; behind hero content, pointer-events disabled.
 */
export function AiBrainBackground({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 800 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice"
        style={{ opacity }}>
        <defs>
          <linearGradient id="brain-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <radialGradient id="brain-node">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hemisphere outline */}
        <g stroke="url(#brain-stroke)" strokeWidth="1.2" fill="none" opacity="0.7">
          <path d="M260 320 C 200 180, 380 80, 520 160 C 640 220, 660 360, 580 440 C 520 500, 380 500, 320 460 C 280 430, 250 380, 260 320 Z" />
          <path d="M320 320 C 300 230, 400 180, 470 220" />
          <path d="M520 240 C 540 320, 480 420, 400 420" />
          <path d="M340 380 C 380 360, 420 360, 480 380" />
          <path d="M360 260 C 420 240, 460 280, 470 320" />
        </g>

        {/* Neural nodes */}
        {[
          [260, 320], [320, 230], [390, 180], [470, 220], [540, 280],
          [520, 380], [440, 440], [340, 420], [300, 360], [400, 320], [430, 270],
          [560, 200], [600, 340], [220, 280], [280, 260], [380, 470], [490, 320],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="14" fill="url(#brain-node)">
              <animate
                attributeName="r"
                values="9;16;9"
                dur={`${3 + (i % 4)}s`}
                begin={`${(i * 0.18).toFixed(2)}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={cx} cy={cy} r="2.4" fill="#a855f7">
              <animate attributeName="fill" values="#22d3ee;#a855f7;#ec4899;#22d3ee" dur="6s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Pulsing connection lines */}
        {[
          [260, 320, 320, 230], [320, 230, 390, 180], [390, 180, 470, 220], [470, 220, 540, 280],
          [540, 280, 520, 380], [520, 380, 440, 440], [440, 440, 340, 420], [340, 420, 300, 360],
          [300, 360, 260, 320], [400, 320, 430, 270], [400, 320, 470, 220], [400, 320, 490, 320],
          [400, 320, 340, 420], [490, 320, 520, 380], [430, 270, 540, 280],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#brain-stroke)" strokeWidth="0.8" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${2.5 + (i % 5)}s`} begin={`${i * 0.12}s`} repeatCount="indefinite" />
          </line>
        ))}
      </svg>
    </div>
  );
}
