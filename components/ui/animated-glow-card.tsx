import * as React from "react";

import { cn } from "@/lib/utils";

type CardCanvasProps = React.HTMLAttributes<HTMLDivElement>;

const CardCanvas = React.forwardRef<HTMLDivElement, CardCanvasProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("card-canvas", className)} {...props}>
      <svg aria-hidden="true" className="glow-filter" focusable="false">
        <filter width="3000%" x="-1000%" height="3000%" y="-1000%" id="unopaq">
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 3 0" />
        </filter>
      </svg>
      <div className="card-backdrop" aria-hidden="true" />
      {children}
    </div>
  ),
);

CardCanvas.displayName = "CardCanvas";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  softColor?: string;
}

const Card = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ children, className, glowColor = "#2f6bff", softColor = "#eef3ff", style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glow-card", className)}
      style={{
        ...style,
        "--glow-color": glowColor,
        "--glow-soft": softColor,
      } as React.CSSProperties}
      {...props}
    >
      <div className="border-element border-left" aria-hidden="true" />
      <div className="border-element border-right" aria-hidden="true" />
      <div className="border-element border-top" aria-hidden="true" />
      <div className="border-element border-bottom" aria-hidden="true" />
      <div className="card-content">{children}</div>
    </div>
  ),
);

Card.displayName = "GlowCard";

export { Card, CardCanvas };
