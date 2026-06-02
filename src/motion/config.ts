import type { Transition, Variants } from "motion/react";

/**
 * Centralised Motion (Framer Motion v12) variants + transitions.
 * Bouncy and alive, never distracting. Every interactive surface pulls from here
 * so timing/easing stays consistent across the app.
 */

/* ── Springs ── */
export const spring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.8,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export const bubbleSpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 26,
};

/* ── Section / page enter ── */
export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: softSpring },
};

/* ── Stagger ── */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerChild: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: softSpring },
};

/* ── Chat message bubble ── */
export const messageBubble: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: bubbleSpring },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

/* ── Interaction primitives ── */
export const buttonHover = { scale: 1.05 } as const;
export const buttonTap = { scale: 0.96 } as const;
export const cardHover = {
  y: -2,
  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
} as const;

/* ── Progress bar fill (overshoot spring) ── */
export const progressEase = [0.34, 1.56, 0.64, 1] as const;
export const progressFillTransition: Transition = {
  duration: 0.8,
  ease: progressEase,
};

/* ── Voice recording pulse ── */
export const voicePulse = {
  scale: [1, 1.12, 1],
  opacity: [1, 0.6, 1],
};
export const voicePulseTransition: Transition = {
  duration: 1.4,
  repeat: Infinity,
  ease: "easeInOut",
};

/* ── Recording radial ring (behind mic) ── */
export const voiceRing = {
  scale: [1, 1.4, 1],
  opacity: [0.4, 0, 0.4],
};
export const voiceRingTransition: Transition = {
  duration: 1.4,
  repeat: Infinity,
  ease: "easeInOut",
};

/**
 * Collapse a transition to instant when the user prefers reduced motion.
 * Pass the result of `useReducedMotion()`.
 */
export function reduce<T extends Transition>(
  t: T,
  prefersReduced: boolean | null,
): Transition {
  return prefersReduced ? { duration: 0 } : t;
}
