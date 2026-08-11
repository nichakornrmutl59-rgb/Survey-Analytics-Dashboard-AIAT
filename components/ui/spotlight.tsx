"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, type SpringOptions, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  size?: number;
  fill?: string;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className,
  size = 360,
  fill = "rgba(114, 220, 255, .72)",
  springOptions = { bounce: 0, damping: 24, stiffness: 180 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);
  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    parent.style.position = "relative";
    parent.style.overflow = "hidden";
    setParentElement(parent);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement],
  );

  useEffect(() => {
    if (!parentElement) return;
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseenter", handleMouseEnter);
    parentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", handleMouseEnter);
      parentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, parentElement]);

  return (
    <motion.div
      ref={containerRef}
      className={cn("pointer-events-none absolute rounded-full blur-2xl transition-opacity duration-300", className)}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        opacity: isHovered ? 1 : 0,
        background: `radial-gradient(circle, ${fill} 0%, transparent 70%)`,
      }}
    />
  );
}
