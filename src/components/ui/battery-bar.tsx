"use client";

interface BatteryBarProps {
  startPercent: number;
  endPercent: number;
}

export function BatteryBar({ startPercent, endPercent }: BatteryBarProps) {
  const chargeWidth = Math.max(0, endPercent - startPercent);
  // Centre of the active band as % from left edge
  const bandCenterPct = startPercent + chargeWidth / 2;

  const labelStyle: React.CSSProperties = {
    color: "white",
    textShadow: "0 0 6px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.8)",
    fontSize: "0.8rem",
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <div
      className="relative h-12 rounded-[var(--shape-md)] overflow-hidden mb-4"
      style={{ background: "var(--md-surface-container-high)" }}
    >
      {/* Pre-existing charge tint (0 → endPercent) */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${endPercent}%`,
          background: "color-mix(in srgb, var(--md-primary) 38%, transparent)",
        }}
      />

      {/* Active charge band (startPercent → endPercent) */}
      <div
        className="absolute inset-y-0"
        style={{
          left: `${startPercent}%`,
          width: `${chargeWidth}%`,
          background: "var(--md-primary)",
        }}
      />

      {/* Divider at start mark */}
      {startPercent > 2 && chargeWidth > 0 && (
        <div
          className="absolute inset-y-0 w-px"
          style={{ left: `${startPercent}%`, background: "rgba(255,255,255,0.35)" }}
        />
      )}

      {/* Charge % label — centred inside the active band */}
      {chargeWidth > 0 && (
        <div
          className="absolute inset-y-0 flex items-center pointer-events-none -translate-x-1/2"
          style={{ left: `${bandCenterPct}%` }}
        >
          <span style={labelStyle}>+{chargeWidth}%</span>
        </div>
      )}
    </div>
  );
}

