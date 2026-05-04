"use client";

interface BatteryBarProps {
  startPercent: number;
  endPercent: number;
}

const LABEL_W_PCT = 9; // approx % of bar width a "XX%" label occupies

export function BatteryBar({ startPercent, endPercent }: BatteryBarProps) {
  const chargeWidth = Math.max(0, endPercent - startPercent);
  const tooClose = chargeWidth < 16;

  // Clamp label positions so they stay fully inside the bar.
  // Start label: anchored at startPercent, pulled slightly right.
  // End   label: anchored at endPercent,   pulled slightly left.
  const startLeft = Math.max(1, Math.min(startPercent, 100 - LABEL_W_PCT * 2));
  const endRight  = Math.max(1, Math.min(100 - endPercent, 100 - LABEL_W_PCT * 2));

  const labelStyle: React.CSSProperties = {
    color: "white",
    textShadow: "0 0 6px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.8)",
    fontSize: "0.75rem",
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

      {/* Divider line at start mark */}
      {startPercent > 2 && chargeWidth > 0 && (
        <div
          className="absolute inset-y-0 w-px"
          style={{
            left: `${startPercent}%`,
            background: "rgba(255,255,255,0.35)",
          }}
        />
      )}

      {/* Labels */}
      {tooClose ? (
        // Single combined label centred on the charge band
        <div
          className="absolute inset-y-0 flex items-center pointer-events-none"
          style={{ left: `${Math.max(1, startPercent)}%` }}
        >
          <span style={labelStyle}>{startPercent}→{endPercent}%</span>
        </div>
      ) : (
        <>
          {/* Start % — floats right from the start mark */}
          <div
            className="absolute inset-y-0 flex items-center pointer-events-none"
            style={{ left: `${startLeft}%` }}
          >
            <span style={labelStyle}>{startPercent}%</span>
          </div>

          {/* End % — floats left from the end mark */}
          <div
            className="absolute inset-y-0 flex items-center pointer-events-none"
            style={{ right: `${endRight}%` }}
          >
            <span style={labelStyle}>{endPercent}%</span>
          </div>
        </>
      )}
    </div>
  );
}
