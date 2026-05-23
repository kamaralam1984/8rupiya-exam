"use client";
import { useRef, useState, type ReactNode, type CSSProperties } from "react";

type Props = {
  children: ReactNode;
  strength?: number;   // 0–1
  tiltDeg?: number;    // max rotation deg
  className?: string;
  style?: CSSProperties;
};

export function Magnetic({ children, strength = 0.35, tiltDeg = 8, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ tx: 0, ty: 0, rx: 0, ry: 0 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    setT({
      tx: dx * strength * 0.4,
      ty: dy * strength * 0.4,
      ry: (dx / r.width) * tiltDeg,
      rx: -(dy / r.height) * tiltDeg,
    });
  }

  function reset() {
    setT({ tx: 0, ty: 0, rx: 0, ry: 0 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
      style={{
        transform: `perspective(900px) translate3d(${t.tx}px, ${t.ty}px, 0) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
        transition: "transform 180ms cubic-bezier(.2,.65,.2,1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
