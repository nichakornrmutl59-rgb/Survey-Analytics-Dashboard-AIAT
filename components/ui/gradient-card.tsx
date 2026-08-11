"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "group relative h-full w-full overflow-hidden rounded-[22px] border p-7 text-left shadow-sm transition-[border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
  {
    variants: {
      gradient: {
        orange: "border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-amber-100/90",
        blue: "border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-indigo-100/90",
        pink: "border-pink-200/80 bg-gradient-to-br from-pink-50 via-white to-rose-100/90",
        cyan: "border-cyan-200/80 bg-gradient-to-br from-cyan-50 via-white to-sky-100/90",
      },
    },
    defaultVariants: {
      gradient: "blue",
    },
  },
);

export interface GradientCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cardVariants> {
  badgeText: string;
  badgeColor: string;
  value: string;
  description: string;
  actionText: string;
  imageUrl?: string;
}

const GradientCard = React.forwardRef<HTMLButtonElement, GradientCardProps>(
  (
    {
      className,
      gradient,
      badgeText,
      badgeColor,
      value,
      description,
      actionText,
      imageUrl,
      ...props
    },
    ref,
  ) => (
    <motion.div
      className="h-full"
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.025, y: -5 } }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
    >
      <button ref={ref} type="button" className={cn(cardVariants({ gradient }), className)} {...props}>
        {imageUrl && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -bottom-14 h-44 w-44 bg-contain bg-center bg-no-repeat opacity-[0.08]"
            style={{ backgroundImage: `url("${imageUrl}")` }}
            variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.12, rotate: 4 } }}
            transition={{ type: "spring", stiffness: 360, damping: 18 }}
          />
        )}

        <span className="relative z-10 flex min-h-[126px] flex-col">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[13px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: badgeColor }} />
            {badgeText}
          </span>
          <strong className="text-[46px] leading-none font-bold tracking-tight text-[#10214b]">{value}</strong>
          <span className="mt-3 text-[13px] leading-relaxed font-medium text-slate-600">{description}</span>
          <span className="mt-auto flex items-center gap-2 pt-5 text-[13px] font-bold text-[#234fc2]">
            {actionText}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </span>
      </button>
    </motion.div>
  ),
);

GradientCard.displayName = "GradientCard";

export { GradientCard, cardVariants };
