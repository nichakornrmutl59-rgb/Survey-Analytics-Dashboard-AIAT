"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

type HeroAction = {
  text: string;
  onClick: () => void;
};

export interface HeroSectionProps extends Omit<HTMLMotionProps<"section">, "title"> {
  kicker: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: HeroAction;
  privacyText: string;
  backgroundImage: string;
  liveValue: string;
  liveLabel: string;
  coverageLabel: string;
  coverageValue: string;
  coveragePercent: number;
  coverageNote: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 22, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      className,
      kicker,
      title,
      subtitle,
      callToAction,
      privacyText,
      backgroundImage,
      liveValue,
      liveLabel,
      coverageLabel,
      coverageValue,
      coveragePercent,
      coverageNote,
      ...props
    },
    ref,
  ) => (
    <motion.section
      ref={ref}
      className={cn("outcome-hero", className)}
      aria-label="ภาพรวมผลลัพธ์ผู้เข้าร่วมโครงการ"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      {...props}
    >
      <motion.div className="outcome-hero-copy" variants={containerVariants}>
        <motion.p className="outcome-hero-kicker" variants={itemVariants}>{kicker}</motion.p>
        <motion.h1 variants={itemVariants}>{title}</motion.h1>
        <motion.div className="outcome-hero-rule" variants={itemVariants} />
        <motion.p className="outcome-hero-description" variants={itemVariants}>{subtitle}</motion.p>
        <motion.div className="outcome-hero-actions" variants={itemVariants}>
          <button type="button" onClick={callToAction.onClick}>
            {callToAction.text}<span aria-hidden="true">→</span>
          </button>
          <span>{privacyText}</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="outcome-hero-visual"
        initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
        animate={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)" }}
        transition={{ duration: 1.05, ease: "circOut" }}
      >
        <motion.div
          className="outcome-hero-logo"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.35, ease: "easeOut" }}
          role="img"
          aria-label="Super AI Engineer"
        />
        <motion.div className="outcome-hero-live" variants={itemVariants}>
          <div className="outcome-live-label"><i /> LIVE DATA</div>
          <strong>{liveValue}</strong>
          <p>{liveLabel}</p>
          <div className="outcome-coverage">
            <div><span>{coverageLabel}</span><b>{coverageValue}</b></div>
            <div className="outcome-coverage-track"><span style={{ width: `${coveragePercent}%` }} /></div>
            <small>{coverageNote}</small>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  ),
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
