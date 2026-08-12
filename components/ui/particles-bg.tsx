"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
};

const COLORS = ["#2F6BFF", "#19BCEB", "#6D4AFF", "#FF4FA3", "#FF7A1A"];

export default function ParticlesComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let animationFrame = 0;
    let mouseX = -10_000;
    let mouseY = -10_000;

    const makeParticle = (x = Math.random() * width, y = Math.random() * height): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      radius: 1 + Math.random() * 1.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.22 + Math.random() * 0.38,
    });

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const particleCount = reduceMotion.matches
        ? 22
        : Math.min(width < 760 ? 38 : 76, Math.max(32, Math.round((width * height) / 18_000)));
      particles = Array.from({ length: particleCount }, () => makeParticle());
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const linkDistance = width < 760 ? 92 : 132;

      particles.forEach((particle, index) => {
        if (!reduceMotion.matches) {
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const mouseDistance = Math.hypot(dx, dy);
          if (mouseDistance < 180 && mouseDistance > 0) {
            const pull = (1 - mouseDistance / 180) * 0.0016;
            particle.vx += dx * pull;
            particle.vy += dy * pull;
          }

          particle.vx *= 0.992;
          particle.vy *= 0.992;
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -10) particle.x = width + 10;
          if (particle.x > width + 10) particle.x = -10;
          if (particle.y < -10) particle.y = height + 10;
          if (particle.y > height + 10) particle.y = -10;
        }

        for (let compareIndex = index + 1; compareIndex < particles.length; compareIndex += 1) {
          const nearby = particles[compareIndex];
          const distance = Math.hypot(particle.x - nearby.x, particle.y - nearby.y);
          if (distance > linkDistance) continue;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(nearby.x, nearby.y);
          context.strokeStyle = `rgba(47, 107, 255, ${(1 - distance / linkDistance) * 0.12})`;
          context.lineWidth = 0.7;
          context.stroke();
        }

        const pulse = reduceMotion.matches ? 1 : 0.84 + Math.sin(frame * 0.018 + index) * 0.16;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fill();
        context.globalAlpha = 1;
      });

      frame += 1;
      animationFrame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onPointerLeave = () => {
      mouseX = -10_000;
      mouseY = -10_000;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reduceMotion.matches || particles.length > 82) return;
      particles.push(...Array.from({ length: 3 }, () => makeParticle(event.clientX, event.clientY)));
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className="dashboard-particles" aria-hidden="true">
      <span className="particle-orb particle-orb-orange" />
      <span className="particle-orb particle-orb-blue" />
      <span className="particle-orb particle-orb-pink" />
      <canvas ref={canvasRef} />
    </div>
  );
}
