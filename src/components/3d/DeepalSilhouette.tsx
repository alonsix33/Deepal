"use client";

export function DeepalSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1A1A1E" />
          <stop offset="100%" stopColor="#2A2A2E" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#0088FF" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="rgba(0,212,255,0.3)" />
          <stop offset="100%" stopColor="rgba(0,212,255,0)" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="400" cy="370" rx="280" ry="12" fill="rgba(0,212,255,0.06)" />

      {/* Main body */}
      <path
        d="M140 280 L180 220 L620 220 L660 280 L690 300 L690 340 L110 340 L110 300 Z"
        fill="url(#bodyGrad)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />

      {/* Roof / cabin */}
      <path
        d="M220 220 L260 155 L540 155 L580 220"
        fill="#1E1E22"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />

      {/* Rear window */}
      <path
        d="M240 215 L275 165 L360 165 L360 215 Z"
        fill="rgba(0,212,255,0.04)"
      />

      {/* Front windshield */}
      <path
        d="M440 165 L525 165 L555 215 L440 215 Z"
        fill="rgba(0,212,255,0.04)"
      />

      {/* Roof accent line */}
      <path
        d="M260 185 L540 185"
        stroke="rgba(0,212,255,0.08)"
        strokeWidth="0.5"
      />

      {/* Headlight - DRL strip */}
      <path
        d="M670 285 L700 285"
        stroke="url(#accentGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="700" cy="285" r="4" fill="url(#accentGrad)" />

      {/* Taillight - through-type */}
      <path
        d="M100 285 L130 285"
        stroke="#FF453A"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Front wheel */}
      <ellipse cx="530" cy="345" rx="38" ry="32" fill="#0E0E10" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <ellipse cx="530" cy="345" rx="18" ry="16" fill="#1A1A1E" />
      <circle cx="530" cy="345" r="4" fill="rgba(0,212,255,0.2)" />
      {/* Spokes hint */}
      <line x1="530" y1="329" x2="530" y2="361" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="512" y1="345" x2="548" y2="345" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

      {/* Rear wheel */}
      <ellipse cx="265" cy="345" rx="38" ry="32" fill="#0E0E10" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <ellipse cx="265" cy="345" rx="18" ry="16" fill="#1A1A1E" />
      <circle cx="265" cy="345" r="4" fill="rgba(0,212,255,0.2)" />
      <line x1="265" y1="329" x2="265" y2="361" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="247" y1="345" x2="283" y2="345" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

      {/* Side character line */}
      <path
        d="M200 290 L640 290"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="0.5"
      />

      {/* Door lines */}
      <line x1="380" y1="225" x2="380" y2="338" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="500" y1="225" x2="500" y2="338" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

      {/* Hidden door handle hint */}
      <rect x="430" y="245" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.05)" />

      {/* Bottom glow line */}
      <path
        d="M160 338 L640 338"
        stroke="url(#glowGrad)"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Underbody glow */}
      <line x1="200" y1="340" x2="600" y2="340" stroke="rgba(0,212,255,0.04)" strokeWidth="2" />
    </svg>
  );
}
