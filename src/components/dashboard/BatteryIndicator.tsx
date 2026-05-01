"use client";

interface Props {
  level: number;
  range: number;
  charging?: boolean;
}

export function BatteryIndicator({ level, range, charging }: Props) {
  const pct = Math.min(100, Math.max(0, level));
  const color =
    pct > 60
      ? "var(--energy-green)"
      : pct > 30
        ? "var(--fuel-amber)"
        : "var(--error)";

  return (
    <div className="flex items-center gap-4">
      {/* Battery icon */}
      <div className="relative">
        <svg width="44" height="24" viewBox="0 0 44 24" fill="none" className="drop-shadow-lg">
          <rect x="0.5" y="2.5" width="36" height="19" rx="3" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
          <rect
            x="3"
            y="5"
            width={pct > 0 ? Math.max(3, (pct / 100) * 31) : 0}
            height="14"
            rx="2"
            fill={color}
            className="transition-all duration-700 ease-out"
          />
          <rect x="38" y="8" width="4" height="8" rx="1" fill={color} fillOpacity="0.3" />
          {charging && (
            <g className="animate-battery-pulse">
              <path d="M12 8 L18 14 L14 14 L16 18 L10 12 L14 12 Z" fill={color} opacity="0.9" />
            </g>
          )}
        </svg>
      </div>

      {/* Numbers */}
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight" style={{ color }}>
            {pct}
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">%</span>
        </div>
        <div className="text-xs text-[var(--text-tertiary)]">
          <span className="font-medium text-[var(--text-secondary)]">{range}</span> km estimados
        </div>
      </div>
    </div>
  );
}
