"use client";

import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: string) => void;
  onInputChange: (v: string) => void;
  disabled?: boolean;
}

// Defined at module scope — NOT inside a parent component.
// Defining it inside a render function causes React to treat it as a new
// component type on every render, unmounting/remounting on each state change.
// That's what broke slider dragging (pointer capture lost) and text input
// focus (DOM element destroyed after each keystroke).
export function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  onInputChange,
  disabled,
}: SliderRowProps) {
  const [raw, setRaw] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync slider → text, but only when the input isn't actively focused.
  // Without this guard the effect would overwrite the user's in-progress typing.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setRaw(value.toString());
    }
  }, [value]);

  const handleTextChange = (v: string) => {
    setRaw(v);
    const n = parseInt(v, 10);
    if (!isNaN(n)) onInputChange(String(n));
  };

  const handleBlur = () => {
    const n = Math.min(max, Math.max(min, parseInt(raw, 10) || min));
    setRaw(n.toString());
    onInputChange(n.toString());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          className="text-xs font-medium"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          {label}
        </Label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={raw}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          style={{
            width: "3.75rem",
            height: "2rem",
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: 700,
            border: "1.5px solid var(--md-primary)",
            borderRadius: "var(--shape-sm)",
            background: "transparent",
            color: "var(--md-on-surface)",
            outline: "none",
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full"
        style={{ accentColor: "var(--md-primary)", touchAction: "none" }}
      />
    </div>
  );
}
